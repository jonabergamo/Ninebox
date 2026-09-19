# Ninebox

A school platform built around the 9 box grid. Teachers create classes, hand out activities with weighted criteria and mark each student's work with four letters, E, G, A or P. Every grade moves the student across a 3x3 board of performance and potential, so growth shows up as movement instead of a number in a spreadsheet. Students see where they stand, what is due and how they got there.

I built the first version in 2023 with a friend's school in mind. In 2026 I folded the two repos into one, rewrote both halves and put it online with a demo school so anyone can walk through it.

Demo at https://ninebox-seven.vercel.app. The sign in page has one click logins for the teacher and for a student. The API sleeps when nobody visits and takes about a minute to wake, so the first login can be slow.

## How the grid moves

Cells are numbered 1 to 9 from the bottom left corner. Everyone starts at cell 2, level 0. After each graded activity

| final grade | activity level | what happens |
| --- | --- | --- |
| below 50, twice in a row | any | drop one cell, or one level when already at cell 1 |
| 90 or more | above the student's level | climb two cells |
| 75 or more | at or above the student's level | climb one cell |
| anything else | any | stay, and a good grade clears the fail streak |

Climbing past cell 9 is a level up and the student restarts at cell 2 one level higher. The rules live in `api/ninebox/grading.py` as pure functions with a test per branch, and every move is recorded so the student page can replay the whole path.

A class can keep more than one grid, for example Academic and Teamwork, and each activity says which grids it moves. The final grade is the weighted mean of the marks on the 25 to 100 scale. Exams feed the same rules with their score.

## Exams with a live clock

A teacher writes a multiple choice exam, picks a duration and opens it when the class is in the room. Everyone's page flips at the same moment and a countdown starts. The clock lives on the server. Opening the exam stamps `ends_at`, the browser only renders the difference to its own clock corrected by the server time it receives, and the first connected socket arms a timer that closes the exam when time is up, grades whatever each student answered so far and tells every page. If nobody is connected when it expires, the next request to that exam settles it. Students save answers as they click, so a dropped connection loses nothing, and they only see which answers were right after the exam closes.

This runs on Django Channels with the in memory channel layer and a single uvicorn process, which is what Render's free tier offers. Swap the layer for Redis if you ever need more than one process.

## What's in the repo

```
api/   Django 5, Django REST Framework and Channels, JWT auth, Postgres, uv, pytest
web/   Next.js 16, React 19, Tailwind 4, shadcn/ui, TanStack Query, Recharts
```

The API is one app, `ninebox`, with the models in one module, a thin service layer and viewsets scoped to the classes the user can see. Teachers own their classes, students only see their own submissions. Students join a class with a six character code, there is no email anywhere.

With `SEED_DEMO=true` the API wipes and rebuilds the demo school on every boot, so each deploy opens clean whatever visitors did before. Two teachers, three classes, 26 students, four subjects, three grids, a semester of graded activities with feedback, late and missing hand ins, a finished exam and a quiz ready to open. The newest activity is left ungraded so the demo teacher always has something to do. The demo logins are `teacher@ninebox.app` and `student@ninebox.app` with the password in `DEMO_PASSWORD`, `ninebox123` by default.

## Running it

You need Python 3.12 with uv, Node 22 with pnpm, and Docker for the database.

```bash
docker compose up -d
cd api && cp .env.example .env && uv sync && uv run manage.py migrate && uv run manage.py seed_demo && uv run uvicorn core.asgi:application --port 8100 --reload
cd web && echo NEXT_PUBLIC_API_URL=http://localhost:8100 > .env.local && pnpm install && pnpm dev
```

The web app is on http://localhost:3000 and Swagger on http://localhost:8100/api/docs. `uv run pytest` in `api` runs the tests, `uv run ruff check .` lints.

## Deploying

The API is a Docker web service on Render, described in `render.yaml`. In the Render dashboard pick New, then Blueprint, point it at this repo and paste a Postgres URL (Neon's free tier works) and a demo password when asked. The web app is imported into Vercel with `web/` as the root directory and `NEXT_PUBLIC_API_URL` pointing at the Render service. `CORS_ORIGINS` on the API must list the Vercel domain.

## What's missing

There is no password reset and no email at all, by choice. Work is handed in as a link, not a file. Exams are multiple choice only. And the demo accounts are shared, so what you grade there everyone sees until the next deploy resets the school.
