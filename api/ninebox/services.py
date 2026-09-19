import csv
from io import StringIO

from django.db import transaction
from django.utils import timezone

from .grading import Position, final_grade, next_position
from .models import Class, Enrollment, Grid, Mark, Placement, PlacementHistory, Submission, User


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

    for grid in activity.grids.all():
        placement, _ = Placement.objects.get_or_create(student=submission.student, grid=grid)
        pos = next_position(
            Position(placement.level, placement.x, placement.y, placement.fail_streak),
            submission.final_grade,
            activity.level,
        )
        placement.level, placement.x, placement.y, placement.fail_streak = pos.level, pos.x, pos.y, pos.fail_streak
        placement.save()
        PlacementHistory.objects.create(
            placement=placement,
            submission=submission,
            level=pos.level,
            x=pos.x,
            y=pos.y,
            grade=submission.final_grade,
            at=submission.graded_at,
        )
    return submission


def grades_csv(class_: Class) -> str:
    activities = list(class_.activities.order_by("created_at"))
    out = StringIO()
    w = csv.writer(out)
    w.writerow(["student", "email", *[a.name for a in activities], "average"])
    subs = {(s.student_id, s.activity_id): s.final_grade for s in Submission.objects.filter(activity__in=activities)}
    for student in class_.students.order_by("name"):
        row = [subs.get((student.id, a.id)) for a in activities]
        graded = [g for g in row if g is not None]
        avg = round(sum(graded) / len(graded), 2) if graded else ""
        w.writerow([student.name, student.email, *["" if g is None else g for g in row], avg])
    return out.getvalue()
