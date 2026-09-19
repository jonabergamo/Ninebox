import pytest
from asgiref.sync import sync_to_async
from channels.testing.websocket import WebsocketCommunicator
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken

from ninebox import services
from ninebox.models import Attempt, Exam, Placement


def make_exam(client, klass, grid, minutes=30):
    r = client.post(
        "/api/exams/",
        {
            "classroom": klass.id,
            "title": "Fractions quiz",
            "duration_minutes": minutes,
            "level": 1,
            "grids": [grid],
            "questions": [
                {"text": "1/2 + 1/4", "points": 2, "choices": [{"text": "3/4", "is_correct": True}, {"text": "2/6", "is_correct": False}]},
                {"text": "2/3 of 9", "points": 1, "choices": [{"text": "6", "is_correct": True}, {"text": "3", "is_correct": False}]},
            ],
        },
        format="json",
    )
    assert r.status_code == 201, r.data
    return r.data


def enrolled(as_, teacher, student, klass):
    grid = as_(teacher).post("/api/grids/", {"classroom": klass.id, "name": "Academic"}).data
    as_(student).post("/api/classes/join/", {"code": klass.code})
    return grid


def test_exam_needs_one_correct_choice(as_, klass, teacher, student):
    grid = enrolled(as_, teacher, student, klass)
    r = as_(teacher).post(
        "/api/exams/",
        {
            "classroom": klass.id,
            "title": "x",
            "grids": [grid["id"]],
            "questions": [{"text": "q", "choices": [{"text": "a", "is_correct": True}, {"text": "b", "is_correct": True}]}],
        },
        format="json",
    )
    assert r.status_code == 400


def test_student_cannot_see_answers_until_closed(as_, klass, teacher, student):
    grid = enrolled(as_, teacher, student, klass)
    exam = make_exam(as_(teacher), klass, grid["id"])
    r = as_(student).get(f"/api/exams/{exam['id']}/")
    assert "is_correct" not in r.data["questions"][0]["choices"][0]
    assert as_(student).post(f"/api/exams/{exam['id']}/open/").status_code == 403


def test_full_exam_flow_moves_the_student(as_, klass, teacher, student):
    grid = enrolled(as_, teacher, student, klass)
    t, s = as_(teacher), as_(student)
    exam = make_exam(t, klass, grid["id"])
    assert s.post(f"/api/exams/{exam['id']}/start/").status_code == 400  # still a draft

    r = t.post(f"/api/exams/{exam['id']}/open/")
    assert r.status_code == 200 and r.data["status"] == "open" and r.data["ends_at"]

    assert s.post(f"/api/exams/{exam['id']}/start/").status_code == 200
    q1, q2 = exam["questions"]
    right = next(c for c in q1["choices"] if c["is_correct"])
    wrong = next(c for c in q2["choices"] if not c["is_correct"])
    assert s.post(f"/api/exams/{exam['id']}/answer/", {"question": q1["id"], "choice": right["id"]}).status_code == 200
    assert s.post(f"/api/exams/{exam['id']}/answer/", {"question": q2["id"], "choice": wrong["id"]}).status_code == 200
    assert s.post(f"/api/exams/{exam['id']}/answer/", {"question": q2["id"], "choice": 999999}).status_code == 400

    r = s.post(f"/api/exams/{exam['id']}/submit/")
    assert r.status_code == 200
    assert r.data["score"] == pytest.approx(66.67)
    assert s.post(f"/api/exams/{exam['id']}/submit/").status_code == 400

    p = Placement.objects.get(student=student, grid=grid["id"])
    assert (p.x, p.y) == (2, 1)  # 66.67 on level 1 from level 0 holds the cell
    tl = t.get(f"/api/students/{student.id}/timeline?grid={grid['id']}").data
    assert tl["history"][0]["kind"] == "exam" and tl["history"][0]["activity"] == "Fractions quiz"

    r = t.post(f"/api/exams/{exam['id']}/close/")
    assert r.status_code == 200 and r.data["status"] == "closed"
    r = s.get(f"/api/exams/{exam['id']}/")
    assert "is_correct" in r.data["questions"][0]["choices"][0]
    assert r.data["my_attempt"]["score"] == pytest.approx(66.67)
    assert t.get(f"/api/exams/{exam['id']}/results/").data[0]["score"] == pytest.approx(66.67)


def test_time_up_closes_and_grades_leftovers(as_, klass, teacher, student):
    grid = enrolled(as_, teacher, student, klass)
    t, s = as_(teacher), as_(student)
    exam_data = make_exam(t, klass, grid["id"], minutes=1)
    t.post(f"/api/exams/{exam_data['id']}/open/")
    s.post(f"/api/exams/{exam_data['id']}/start/")
    exam = Exam.objects.get(id=exam_data["id"])
    exam.ends_at = timezone.now() - timezone.timedelta(seconds=1)
    exam.save()
    r = s.get(f"/api/exams/{exam.id}/")  # touching it settles the clock
    assert r.data["status"] == "closed"
    assert Attempt.objects.get(exam=exam, student=student).score == 0
    assert s.post(f"/api/exams/{exam.id}/answer/", {"question": 1, "choice": 1}).status_code == 400


def test_csv_gets_exam_columns(as_, klass, teacher, student):
    grid = enrolled(as_, teacher, student, klass)
    t = as_(teacher)
    exam = make_exam(t, klass, grid["id"])
    t.post(f"/api/exams/{exam['id']}/open/")
    as_(student).post(f"/api/exams/{exam['id']}/start/")
    t.post(f"/api/exams/{exam['id']}/close/")
    body = t.get(f"/api/classes/{klass.id}/export.csv/").content.decode()
    assert "exam: Fractions quiz" in body.splitlines()[0]


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_socket_sends_state_and_rejects_strangers(teacher, student, klass):
    from core.asgi import application

    grid = await sync_to_async(services.open_grid)(klass, "Academic")
    await sync_to_async(services.enroll)(student, klass)
    exam = await sync_to_async(Exam.objects.create)(classroom=klass, title="Live", duration_minutes=5, created_by=teacher)
    await sync_to_async(exam.grids.set)([grid])

    token = str(AccessToken.for_user(student))
    comm = WebsocketCommunicator(application, f"/ws/exams/{exam.id}/?token={token}")
    ok, _ = await comm.connect()
    assert ok
    msg = await comm.receive_json_from()
    assert msg["kind"] == "state" and msg["status"] == "draft" and msg["connected"] == 1
    await comm.disconnect()

    stranger = WebsocketCommunicator(application, f"/ws/exams/{exam.id}/?token=nope")
    ok, code = await stranger.connect()
    assert not ok and code == 4401


def test_reopen_takes_the_move_back(as_, klass, teacher, student):
    grid = enrolled(as_, teacher, student, klass)
    t, s = as_(teacher), as_(student)
    exam = make_exam(t, klass, grid["id"])  # level 1
    t.post(f"/api/exams/{exam['id']}/open/")
    s.post(f"/api/exams/{exam['id']}/start/")
    for q in exam["questions"]:
        right = next(c for c in q["choices"] if c["is_correct"])
        s.post(f"/api/exams/{exam['id']}/answer/", {"question": q["id"], "choice": right["id"]})
    s.post(f"/api/exams/{exam['id']}/submit/")
    t.post(f"/api/exams/{exam['id']}/close/")
    p = Placement.objects.get(student=student, grid=grid["id"])
    assert (p.x, p.y) == (2, 2)  # 100 on a harder exam climbed two cells

    assert s.post(f"/api/exams/{exam['id']}/reopen/").status_code == 403
    r = t.post(f"/api/exams/{exam['id']}/reopen/")
    assert r.status_code == 200 and r.data["status"] == "draft" and r.data["ends_at"] is None
    p.refresh_from_db()
    assert (p.x, p.y, p.level) == (2, 1, 0)
    assert Attempt.objects.filter(exam_id=exam["id"]).count() == 0
    assert t.get(f"/api/students/{student.id}/timeline?grid={grid['id']}").data["history"] == []

    # and it can run again
    assert t.post(f"/api/exams/{exam['id']}/open/").status_code == 200
    assert s.post(f"/api/exams/{exam['id']}/start/").status_code == 200
