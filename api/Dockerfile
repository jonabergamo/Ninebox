FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_COMPILE_BYTECODE=1
WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY . .
RUN SECRET_KEY=build uv run manage.py collectstatic --noinput
EXPOSE 8000
CMD ["sh", "-c", "uv run manage.py migrate --noinput && ([ \"$SEED_DEMO\" = true ] && uv run manage.py seed_demo --reset || true) && uv run uvicorn core.asgi:application --host 0.0.0.0 --port ${PORT:-8000}"]
