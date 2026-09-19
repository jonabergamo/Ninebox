from ninebox.models import Placement, Submission


def make_activity(client, klass, grid, level=0):
    r = client.post(
        "/api/activities/",
        {
            "classroom": klass.id,
            "name": "Essay",
            "level": level,
            "grids": [grid],
            "criteria": [{"description": "Content", "weight": 2}, {"description": "Grammar", "weight": 1}],
        },
        format="json",
    )
    assert r.status_code == 201, r.data
    return r.data


def test_register_returns_tokens(db):
    from rest_framework.test import APIClient

    r = APIClient().post("/api/auth/register", {"name": "N", "email": "n@x.com", "password": "password123", "role": "student"})
    assert r.status_code == 201
    assert r.data["access"] and r.data["user"]["role"] == "student"


def test_student_joins_by_code_and_gets_placements(as_, klass, student, teacher):
    grid = as_(teacher).post("/api/grids/", {"classroom": klass.id, "name": "Academic"}).data
    r = as_(student).post("/api/classes/join/", {"code": " abc234 "})
    assert r.status_code == 200
    assert Placement.objects.filter(student=student, grid=grid["id"]).exists()
    assert as_(student).get("/api/classes/").data[0]["id"] == klass.id


def test_bad_code_is_rejected(as_, student):
    assert as_(student).post("/api/classes/join/", {"code": "NOPE00"}).status_code == 400


def test_other_teacher_cannot_see_the_class(as_, klass, other_teacher):
    assert as_(other_teacher).get(f"/api/classes/{klass.id}/").status_code == 404
    r = as_(other_teacher).post("/api/grids/", {"classroom": klass.id, "name": "X"})
    assert r.status_code == 403


def test_student_cannot_create_or_grade(as_, klass, student, teacher):
    as_(student).post("/api/classes/join/", {"code": "ABC234"})
    assert as_(student).post("/api/grids/", {"classroom": klass.id, "name": "X"}).status_code == 403
    grid = as_(teacher).post("/api/grids/", {"classroom": klass.id, "name": "Academic"}).data
    make_activity(as_(teacher), klass, grid["id"])
    sub = Submission.objects.get(student=student)
    assert as_(student).post(f"/api/submissions/{sub.id}/grade/", {"marks": []}, format="json").status_code == 403


def test_grading_moves_the_student(as_, klass, student, teacher):
    t = as_(teacher)
    grid = t.post("/api/grids/", {"classroom": klass.id, "name": "Academic"}).data
    as_(student).post("/api/classes/join/", {"code": "ABC234"})
    activity = make_activity(t, klass, grid["id"], level=1)
    sub = Submission.objects.get(student=student, activity=activity["id"])

    r = as_(student).post(f"/api/submissions/{sub.id}/submit/", {"link": "https://example.com/essay"})
    assert r.status_code == 200 and r.data["submitted_at"]

    marks = [{"criterion_id": c["id"], "grade": "E"} for c in activity["criteria"]]
    r = t.post(f"/api/submissions/{sub.id}/grade/", {"marks": marks}, format="json")
    assert r.status_code == 200
    assert r.data["final_grade"] == 100

    p = Placement.objects.get(student=student, grid=grid["id"])
    assert (p.x, p.y) == (2, 2)  # cell 2 climbs twice to cell 5 on a harder activity

    tl = t.get(f"/api/students/{student.id}/timeline?grid={grid['id']}")
    assert tl.status_code == 200 and len(tl.data["history"]) == 1 and tl.data["history"][0]["grade"] == 100

    heat = t.get(f"/api/classes/{klass.id}/heatmap/")
    assert heat.data[0]["placements"][0]["x"] == 2

    csv = t.get(f"/api/classes/{klass.id}/export.csv/")
    assert csv.status_code == 200
    assert "Student,s@x.com,100.0,100.0" in csv.content.decode()


def test_grading_needs_every_criterion(as_, klass, student, teacher):
    t = as_(teacher)
    grid = t.post("/api/grids/", {"classroom": klass.id, "name": "Academic"}).data
    as_(student).post("/api/classes/join/", {"code": "ABC234"})
    activity = make_activity(t, klass, grid["id"])
    sub = Submission.objects.get(student=student)
    r = t.post(f"/api/submissions/{sub.id}/grade/", {"marks": [{"criterion_id": activity["criteria"][0]["id"], "grade": "E"}]}, format="json")
    assert r.status_code == 400
