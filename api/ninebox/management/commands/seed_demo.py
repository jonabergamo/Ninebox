import random
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from ninebox import services
from ninebox.models import Activity, Attempt, Choice, Class, Criterion, Exam, PlacementHistory, Question, Subject, Submission, User

TEACHER = "teacher@ninebox.app"
STUDENT = "student@ninebox.app"
DOMAIN = "@ninebox.app"

FIRST = [
    "Ana Beatriz",
    "Bruno",
    "Camila",
    "Diego",
    "Eduarda",
    "Felipe",
    "Gabriela",
    "Henrique",
    "Isabela",
    "João Pedro",
    "Larissa",
    "Mateus",
    "Nicole",
    "Otávio",
    "Paula",
    "Rafael",
    "Sofia",
    "Thiago",
    "Valentina",
    "Vinícius",
    "Yasmin",
    "Arthur",
    "Beatriz",
    "Caio",
    "Helena",
    "Lucas",
]
LAST = [
    "Costa",
    "Rocha",
    "Martins",
    "Lima",
    "Souza",
    "Nunes",
    "Alves",
    "Freitas",
    "Melo",
    "Ribeiro",
    "Carvalho",
    "Teixeira",
    "Barbosa",
    "Moreira",
    "Cardoso",
    "Pereira",
    "Araújo",
    "Dias",
    "Monteiro",
    "Campos",
    "Farias",
    "Correia",
    "Batista",
    "Cunha",
    "Lopes",
    "Machado",
]

SUBJECTS = ["Portuguese", "Maths", "Science", "History"]
GRIDS = ["Academic", "Teamwork", "Effort"]

# (name, level, subjects, criteria, description, grids besides Academic)
ACTIVITIES = [
    (
        "Reading diary",
        0,
        ["Portuguese"],
        ["Comprehension", "Regularity"],
        "Read one chapter a day and write three lines about it. Bring the diary on Friday.",
        ["Effort"],
    ),
    (
        "Fractions worksheet",
        0,
        ["Maths"],
        ["Accuracy", "Method shown"],
        "Twenty exercises on adding and comparing fractions. Show the steps, not only the answer.",
        [],
    ),
    (
        "Water cycle poster",
        1,
        ["Science"],
        ["Content", "Presentation", "Teamwork"],
        "In groups of three, a poster explaining the water cycle with at least one local example.",
        ["Teamwork"],
    ),
    (
        "Interview a grandparent",
        1,
        ["History", "Portuguese"],
        ["Questions", "Writing", "Listening"],
        "Interview someone born before 1970 about school in their time. Two pages.",
        ["Effort"],
    ),
    (
        "Short story",
        1,
        ["Portuguese"],
        ["Creativity", "Grammar", "Structure"],
        "A story with a beginning, a turn and an ending. Between 600 and 900 words.",
        [],
    ),
    (
        "Geometry challenge",
        2,
        ["Maths"],
        ["Accuracy", "Reasoning"],
        "Five problems on area and perimeter of composite shapes. Explain the reasoning in words.",
        [],
    ),
    (
        "Plant experiment",
        2,
        ["Science"],
        ["Method", "Report", "Data"],
        "Grow beans under three light conditions for two weeks and report the results with a table.",
        ["Effort"],
    ),
    ("Timeline of Brazil", 1, ["History"], ["Accuracy", "Design"], "A timeline with ten events between 1500 and 1900, each with one sentence.", []),
    (
        "Debate on recycling",
        2,
        ["Portuguese", "Science"],
        ["Argument", "Listening", "Teamwork"],
        "Two teams, twenty minutes. Prepare three arguments and anticipate the other side.",
        ["Teamwork"],
    ),
    (
        "Statistics project",
        3,
        ["Maths"],
        ["Data", "Charts", "Conclusion"],
        "Survey twenty people about a question you choose, chart the results and write what they show.",
        ["Effort"],
    ),
    ("Book review", 2, ["Portuguese"], ["Summary", "Opinion", "Grammar"], "Review the book you read this term. Recommend it or not, and say why.", []),
    (
        "Ecosystem model",
        3,
        ["Science"],
        ["Content", "Build quality", "Teamwork"],
        "Build a model of a Brazilian biome and present it to the class in five minutes.",
        ["Teamwork"],
    ),
    (
        "Independence essay",
        3,
        ["History", "Portuguese"],
        ["Argument", "Sources", "Writing"],
        "Was 1822 a rupture or a continuation? Use at least two sources from the reader.",
        [],
    ),
    ("Probability games", 3, ["Maths"], ["Accuracy", "Explanation"], "Design a fair game with dice or cards and prove it is fair.", ["Teamwork"]),
]

FEEDBACK = {
    "E": ["Excellent work, this went beyond what I asked.", "Clear, complete and on time. Keep this up.", "You explained your thinking really well here."],
    "G": ["Good work. A little more detail would make it excellent.", "Solid effort, just tidy up the presentation next time.", "Well done, small slips only."],
    "A": [
        "You have the idea but the execution needs care.",
        "Halfway there. Review the steps we did in class.",
        "Some parts are missing, come talk to me about them.",
    ],
    "P": [
        "This needs to be redone. Let's go through it together.",
        "Very little here. Ask for help earlier next time.",
        "Not what was asked. Read the instructions again.",
    ],
}

EXAM_QUESTIONS = [
    ("Which fraction equals 0.75?", 2, ["3/4", "2/3", "7/5", "1/4"]),
    ("The perimeter of a square with side 6 cm is", 1, ["24 cm", "36 cm", "12 cm", "18 cm"]),
    ("Which state of water falls as rain?", 1, ["liquid", "solid", "gas", "plasma"]),
    ("Brazil declared independence in", 1, ["1822", "1500", "1889", "1808"]),
    ("A noun is a word that names", 1, ["a thing, person or place", "an action", "a quality", "a connection"]),
    ("2/3 of 27 is", 2, ["18", "9", "12", "21"]),
    ("Plants make their food through", 1, ["photosynthesis", "digestion", "respiration", "fermentation"]),
    ("The capital of Brazil is", 1, ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"]),
]


class Command(BaseCommand):
    help = "A believable school so the demo is never empty. --reset wipes and rebuilds it."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true")

    def handle(self, *args, **opts):
        if opts["reset"]:
            User.objects.filter(email__endswith=DOMAIN).delete()  # classes and everything under them cascade
            self.stdout.write("demo school wiped")
        if User.objects.filter(email=TEACHER).exists():
            self.stdout.write("demo school already there")
            return

        rnd = random.Random(27)
        pw = settings.DEMO_PASSWORD
        now = timezone.now()

        marina = self.user(TEACHER, "Profa. Marina Duarte", User.Role.TEACHER, pw)
        caio = self.user("caio@ninebox.app", "Prof. Caio Andrade", User.Role.TEACHER, pw)

        names = [f"{first} {last}" for first, last in zip(FIRST, rnd.sample(LAST, len(FIRST)), strict=True)]
        students = [self.user(STUDENT, names[0], User.Role.STUDENT, pw)]
        students += [self.user(f"aluno{i:02d}{DOMAIN}", n, User.Role.STUDENT, pw) for i, n in enumerate(names[1:], start=2)]

        c7b = self.school(marina, "7º ano B", "DEMO7B", students[:14], rnd, now, weeks=16, exam=True)
        self.school(marina, "8º ano A", "DEMO8A", students[14:], rnd, now, weeks=12, exam=False)
        # caio's class shows a teacher only sees their own, and the demo student is in it too
        self.school(caio, "6º ano C", "DEMO6C", [students[0], *students[14:20]], rnd, now, weeks=8, exam=False, offset=3)

        self.stdout.write(f"demo school ready. teacher {TEACHER}, student {STUDENT}, password {pw}, class {c7b.code}")

    def school(self, teacher, name, code, students, rnd, now, weeks, exam, offset=0):
        class_ = Class.objects.create(teacher=teacher, name=name, code=code)
        subjects = {n: Subject.objects.create(classroom=class_, name=n) for n in SUBJECTS}
        grids = {n: services.open_grid(class_, n) for n in GRIDS}
        for s in students:
            services.enroll(s, class_)

        # a temperament per student. a couple of them dip and recover so timelines have a story
        talent = {s.id: rnd.choice(["strong", "strong", "steady", "steady", "steady", "steady", "struggling", "dipper"]) for s in students}
        start = now - timedelta(weeks=weeks)
        plan = ACTIVITIES[offset : offset + max(6, weeks - 2)]
        gap = timedelta(days=(weeks * 7) // (len(plan) + 1))

        for i, (title, level, subj, crits, desc, extra) in enumerate(plan):
            created_at = start + gap * (i + 1)
            act = Activity.objects.create(
                classroom=class_, name=title, description=desc, level=level, due_at=created_at + timedelta(days=6), created_by=teacher
            )
            Activity.objects.filter(pk=act.pk).update(created_at=created_at)
            act.subjects.set([subjects[x] for x in subj])
            act.grids.set([grids["Academic"], *[grids[g] for g in extra]])
            Criterion.objects.bulk_create([Criterion(activity=act, description=c, weight=2 if j == 0 else 1) for j, c in enumerate(crits)])
            services.open_activity(act)

            newest = i == len(plan) - 1
            for s in students:
                sub = Submission.objects.get(activity=act, student=s)
                r = rnd.random()
                if newest:
                    if r < 0.7:
                        self.hand_in(sub, created_at, rnd)
                    continue
                if r < 0.06:
                    continue  # never handed in
                self.hand_in(sub, created_at, rnd, late=r > 0.85)
                phase = "late" if i >= len(plan) * 0.6 else "early"
                marks = [{"criterion_id": c.id, "grade": self.mark(talent[s.id], phase, rnd), "feedback": ""} for c in act.criteria.all()]
                for m in marks:
                    if rnd.random() < 0.6:
                        m["feedback"] = rnd.choice(FEEDBACK[m["grade"]])
                services.grade(sub, marks)
                when = sub.submitted_at + timedelta(days=rnd.randint(1, 4))
                Submission.objects.filter(pk=sub.pk).update(graded_at=when)
                PlacementHistory.objects.filter(submission=sub).update(at=when)

        if exam:
            self.exams(class_, teacher, students, grids, talent, rnd, now)
        return class_

    def exams(self, class_, teacher, students, grids, talent, rnd, now):
        done = Exam.objects.create(
            classroom=class_,
            title="Term review",
            instructions="Eight questions, thirty minutes. One answer per question.",
            duration_minutes=30,
            level=2,
            created_by=teacher,
            status=Exam.Status.CLOSED,
            opened_at=now - timedelta(days=9),
            ends_at=now - timedelta(days=9) + timedelta(minutes=30),
        )
        done.grids.set([grids["Academic"]])
        self.questions(done)
        qs = list(done.questions.prefetch_related("choices"))
        for s in students:
            if rnd.random() < 0.1:
                continue
            answers = {}
            hit = {"strong": 0.9, "steady": 0.7, "struggling": 0.4, "dipper": 0.6}[talent[s.id]]
            for q in qs:
                choices = list(q.choices.all())
                pick = next(c for c in choices if c.is_correct) if rnd.random() < hit else rnd.choice([c for c in choices if not c.is_correct])
                answers[str(q.id)] = pick.id
            a = Attempt.objects.create(exam=done, student=s, answers=answers)
            Attempt.objects.filter(pk=a.pk).update(started_at=done.opened_at + timedelta(minutes=rnd.randint(0, 3)))
            services.submit_attempt(a, done.opened_at + timedelta(minutes=rnd.randint(12, 29)))

        upcoming = Exam.objects.create(
            classroom=class_,
            title="Fractions and geometry quiz",
            instructions="Ten minutes, five questions. Open it when everyone is in the room.",
            duration_minutes=10,
            level=3,
            created_by=teacher,
        )
        upcoming.grids.set([grids["Academic"]])
        self.questions(upcoming, EXAM_QUESTIONS[:2] + [EXAM_QUESTIONS[5], EXAM_QUESTIONS[1], EXAM_QUESTIONS[0]])

    def questions(self, exam, bank=EXAM_QUESTIONS):
        for i, (text, points, options) in enumerate(bank):
            q = Question.objects.create(exam=exam, text=text, points=points, order=i)
            Choice.objects.bulk_create([Choice(question=q, text=o, is_correct=j == 0) for j, o in enumerate(options)])

    @staticmethod
    def hand_in(sub, created_at, rnd, late=False):
        sub.link = f"https://docs.google.com/document/d/demo-{sub.activity_id}-{sub.student_id}"
        sub.submitted_at = created_at + timedelta(days=rnd.randint(7, 9) if late else rnd.randint(1, 6), hours=rnd.randint(8, 21))
        sub.save()

    def user(self, email, name, role, pw):
        u = User.objects.filter(email=email).first()
        return u or User.objects.create_user(email=email, password=pw, name=name, role=role)

    @staticmethod
    def mark(talent, phase, rnd):
        table = {
            "strong": {"early": "EEEGGA", "late": "EEEEGG"},
            "steady": {"early": "EGGGAAP", "late": "EGGGAA"},
            "struggling": {"early": "GAAPPP", "late": "GGAAPP"},
            "dipper": {"early": "EGGA", "late": "PPPAAGE"},
        }
        return rnd.choice(table[talent][phase])
