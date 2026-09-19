import random
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from ninebox import services
from ninebox.models import Activity, Class, Criterion, PlacementHistory, Subject, Submission, User

TEACHER = "teacher@ninebox.app"
STUDENT = "student@ninebox.app"

STUDENTS = [
    "Ana Beatriz",
    "Bruno Costa",
    "Camila Rocha",
    "Diego Martins",
    "Eduarda Lima",
    "Felipe Souza",
    "Gabriela Nunes",
    "Henrique Alves",
    "Isabela Freitas",
    "João Pedro",
    "Larissa Melo",
    "Mateus Ribeiro",
]

ACTIVITIES = [
    ("Reading diary", 0, ["Portuguese"], ["Text comprehension", "Effort"]),
    ("Fractions worksheet", 0, ["Maths"], ["Accuracy", "Method"]),
    ("Water cycle poster", 1, ["Science"], ["Content", "Presentation", "Teamwork"]),
    ("Short story", 1, ["Portuguese"], ["Creativity", "Grammar"]),
    ("Geometry challenge", 2, ["Maths"], ["Accuracy", "Reasoning"]),
    ("Plant experiment", 2, ["Science"], ["Method", "Report"]),
    ("Debate", 2, ["Portuguese", "Science"], ["Argument", "Listening"]),
    ("Statistics project", 3, ["Maths"], ["Data", "Charts", "Conclusion"]),
]


class Command(BaseCommand):
    help = "A small school so the demo is never empty. Safe to run twice."

    def handle(self, *args, **opts):
        rnd = random.Random(27)
        pw = settings.DEMO_PASSWORD

        teacher = self.user(TEACHER, "Profa. Marina", User.Role.TEACHER, pw)
        class_, created = Class.objects.get_or_create(teacher=teacher, name="7º ano B", defaults={"code": "DEMO7B"})
        Class.objects.get_or_create(teacher=teacher, name="8º ano A", defaults={"code": "DEMO8A"})
        if not created:
            self.stdout.write("demo school already there")
            return

        subjects = {n: Subject.objects.create(classroom=class_, name=n) for n in ["Portuguese", "Maths", "Science"]}
        grids = {n: services.open_grid(class_, n) for n in ["Academic", "Teamwork"]}

        students = [self.user(STUDENT, STUDENTS[0], User.Role.STUDENT, pw)]
        students += [self.user(f"student{i}@ninebox.app", name, User.Role.STUDENT, pw) for i, name in enumerate(STUDENTS[1:], start=2)]
        for s in students:
            services.enroll(s, class_)

        # each student has a temperament so the heatmap spreads out instead of clumping
        talent = {s.id: rnd.choice(["strong", "strong", "steady", "steady", "steady", "struggling"]) for s in students}
        start = timezone.now() - timedelta(weeks=8)

        for i, (name, level, subj, crits) in enumerate(ACTIVITIES):
            created_at = start + timedelta(weeks=i)
            activity = Activity.objects.create(
                classroom=class_,
                name=name,
                description=f"{name} for the whole class. Hand in the link before the due date.",
                level=level,
                due_at=created_at + timedelta(days=5),
                created_by=teacher,
            )
            Activity.objects.filter(pk=activity.pk).update(created_at=created_at)
            activity.subjects.set([subjects[s] for s in subj])
            activity.grids.set([grids["Academic"]] + ([grids["Teamwork"]] if "Teamwork" in crits or name == "Debate" else []))
            Criterion.objects.bulk_create([Criterion(activity=activity, description=c, weight=2 if j == 0 else 1) for j, c in enumerate(crits)])
            services.open_activity(activity)

            last = i == len(ACTIVITIES) - 1
            for s in students:
                sub = Submission.objects.get(activity=activity, student=s)
                if last and rnd.random() < 0.4:
                    continue  # still pending, gives the teacher something to grade in the demo
                sub.link = f"https://docs.google.com/document/d/demo-{activity.id}-{s.id}"
                sub.submitted_at = created_at + timedelta(days=rnd.randint(1, 5))
                sub.save()
                if last:
                    continue
                marks = [{"criterion_id": c.id, "grade": self.mark(talent[s.id], rnd), "feedback": ""} for c in activity.criteria.all()]
                services.grade(sub, marks)
                Submission.objects.filter(pk=sub.pk).update(graded_at=sub.submitted_at + timedelta(days=2))
                PlacementHistory.objects.filter(submission=sub).update(at=sub.submitted_at + timedelta(days=2))

        self.stdout.write(f"demo school ready. teacher {TEACHER}, student {STUDENT}, password {pw}")

    def user(self, email, name, role, pw):
        u = User.objects.filter(email=email).first()
        if u:
            return u
        return User.objects.create_user(email=email, password=pw, name=name, role=role)

    @staticmethod
    def mark(talent, rnd):
        table = {
            "strong": "EEEGGA",
            "steady": "EGGGAAP",
            "struggling": "GAAPPP",
        }
        return rnd.choice(table[talent])
