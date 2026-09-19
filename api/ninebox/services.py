import csv
from io import StringIO

from django.db import transaction
from django.utils import timezone

from .grading import Position, final_grade, next_position
from .models import Attempt, Class, Enrollment, Exam, Grid, Mark, Placement, PlacementHistory, Submission, User


def enroll(student: User, class_: Class):
    _, created = Enrollment.objects.get_or_create(student=student, classroom=class_)
    for grid in class_.grids.all():
        Placement.objects.get_or_create(student=student, grid=grid)
    for activity in class_.activities.all():
        Submission.objects.get_or_create(activity=activity, student=student)
    return created


def open_grid(class_: Class, name: str):
    grid = Grid.objects.create(classroom=class_, name=name)
    Placement.objects.bulk_create([Placement(student=s, grid=grid) for s in class_.students.all()])
    return grid


def open_activity(activity):
    Submission.objects.bulk_create(
        [Submission(activity=activity, student=s) for s in activity.classroom.students.all()],
        ignore_conflicts=True,
    )


@transaction.atomic
def grade(submission: Submission, marks: list[dict]):
    """marks: [{criterion_id, grade, feedback}]. Replaces earlier marks, recomputes the grade
    and moves the student on every grid the activity is attached to."""
    activity = submission.activity
    by_id = {c.id: c for c in activity.criteria.all()}
    if set(by_id) != {m["criterion_id"] for m in marks}:
        raise ValueError("every criterion needs one mark")

    submission.marks.all().delete()
    Mark.objects.bulk_create([Mark(submission=submission, criterion=by_id[m["criterion_id"]], grade=m["grade"], feedback=m.get("feedback", "")) for m in marks])
    submission.final_grade = final_grade((m["grade"], by_id[m["criterion_id"]].weight) for m in marks)
    submission.graded_at = timezone.now()
    submission.save()

    apply_grade(
        submission.student, activity.grids.all(), submission.final_grade, activity.level, submission.graded_at, submission=submission, label=activity.name
    )
    return submission


def apply_grade(student, grids, grade, level, when, submission=None, attempt=None, label=""):
    """move the student on every grid and keep the trail. activities and exams both end up here"""
    for grid in grids:
        placement, _ = Placement.objects.get_or_create(student=student, grid=grid)
        pos = next_position(Position(placement.level, placement.x, placement.y, placement.fail_streak), grade, level)
        placement.level, placement.x, placement.y, placement.fail_streak = pos.level, pos.x, pos.y, pos.fail_streak
        placement.save()
        PlacementHistory.objects.create(
            placement=placement, submission=submission, attempt=attempt, label=label, level=pos.level, x=pos.x, y=pos.y, grade=grade, at=when
        )


# ---- exams


def open_exam(exam: Exam, now=None):
    now = now or timezone.now()
    exam.status = Exam.Status.OPEN
    exam.opened_at = now
    exam.ends_at = now + timezone.timedelta(minutes=exam.duration_minutes)
    exam.save()
    return exam


def score_attempt(attempt: Attempt) -> float:
    total = 0
    got = 0
    for q in attempt.exam.questions.prefetch_related("choices"):
        total += q.points
        picked = attempt.answers.get(str(q.id))
        if picked and any(c.id == int(picked) and c.is_correct for c in q.choices.all()):
            got += q.points
    return round(got * 100 / total, 2) if total else 0.0


@transaction.atomic
def submit_attempt(attempt: Attempt, when=None):
    if attempt.submitted_at:
        return attempt
    attempt.submitted_at = when or timezone.now()
    attempt.score = score_attempt(attempt)
    attempt.save()
    exam = attempt.exam
    apply_grade(attempt.student, exam.grids.all(), attempt.score, exam.level, attempt.submitted_at, attempt=attempt, label=exam.title)
    return attempt


@transaction.atomic
def close_exam(exam: Exam):
    """time is up or the teacher stopped it. whatever a student answered so far counts"""
    if exam.status == Exam.Status.CLOSED:
        return exam
    when = min(timezone.now(), exam.ends_at) if exam.ends_at else timezone.now()
    for attempt in exam.attempts.filter(submitted_at__isnull=True):
        submit_attempt(attempt, when)
    exam.status = Exam.Status.CLOSED
    exam.save()
    return exam


def grades_csv(class_: Class) -> str:
    activities = list(class_.activities.order_by("created_at"))
    exams = list(class_.exams.filter(status=Exam.Status.CLOSED).order_by("created_at"))
    out = StringIO()
    w = csv.writer(out)
    w.writerow(["student", "email", *[a.name for a in activities], *[f"exam: {e.title}" for e in exams], "average"])
    subs = {(s.student_id, s.activity_id): s.final_grade for s in Submission.objects.filter(activity__in=activities)}
    tries = {(a.student_id, a.exam_id): a.score for a in Attempt.objects.filter(exam__in=exams)}
    for student in class_.students.order_by("name"):
        row = [subs.get((student.id, a.id)) for a in activities] + [tries.get((student.id, e.id)) for e in exams]
        graded = [g for g in row if g is not None]
        avg = round(sum(graded) / len(graded), 2) if graded else ""
        w.writerow([student.name, student.email, *["" if g is None else g for g in row], avg])
    return out.getvalue()
