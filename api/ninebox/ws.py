import asyncio
from datetime import datetime

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.urls import re_path
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication

from . import services
from .models import Exam

# one timer per exam per process. close_exam is idempotent so a stray duplicate does no harm
timers: dict[int, asyncio.Task] = {}
present: dict[int, set[str]] = {}


@database_sync_to_async
def user_from_token(raw):
    auth = JWTAuthentication()
    try:
        return auth.get_user(auth.get_validated_token(raw))
    except Exception:
        return None


@database_sync_to_async
def visible_exam(exam_id, user):
    exam = Exam.objects.filter(id=exam_id).first()
    if not exam:
        return None
    if user.is_teacher:
        return exam if exam.classroom.teacher_id == user.id else None
    return exam if exam.classroom.students.filter(id=user.id).exists() else None


@database_sync_to_async
def state_of(exam_id):
    from .exams_api import exam_state

    return exam_state(Exam.objects.get(id=exam_id))


@database_sync_to_async
def close_now(exam_id):
    from .exams_api import exam_state

    exam = Exam.objects.get(id=exam_id)
    services.close_exam(exam)
    return exam_state(exam)


class ExamConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.exam_id = int(self.scope["url_route"]["kwargs"]["exam_id"])
        token = dict(p.split("=", 1) for p in self.scope["query_string"].decode().split("&") if "=" in p).get("token")
        self.user = await user_from_token(token) if token else None
        exam = await visible_exam(self.exam_id, self.user) if self.user else None
        if not exam:
            return await self.close(code=4401)
        self.group = f"exam_{self.exam_id}"
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()
        present.setdefault(self.exam_id, set()).add(self.channel_name)
        state = await state_of(self.exam_id)
        self.arm_timer(state)
        await self.channel_layer.group_send(self.group, {"type": "exam.event", "payload": {**state, "connected": len(present[self.exam_id])}})

    async def disconnect(self, code):
        if not hasattr(self, "group"):
            return
        present.get(self.exam_id, set()).discard(self.channel_name)
        await self.channel_layer.group_discard(self.group, self.channel_name)
        state = await state_of(self.exam_id)
        await self.channel_layer.group_send(self.group, {"type": "exam.event", "payload": {**state, "connected": len(present.get(self.exam_id, ()))}})

    async def exam_event(self, event):
        payload = {**event["payload"]}
        payload.setdefault("connected", len(present.get(self.exam_id, ())))
        self.arm_timer(payload)
        await self.send_json(payload)

    # the first consumer that sees an open exam with an end time owns the alarm clock
    def arm_timer(self, state):
        if state.get("status") != "open" or not state.get("ends_at") or self.exam_id in timers:
            return
        ends = datetime.fromisoformat(state["ends_at"])
        delay = max(0.0, (ends - timezone.now()).total_seconds())
        timers[self.exam_id] = asyncio.create_task(self.ring(delay))

    async def ring(self, delay):
        try:
            await asyncio.sleep(delay)
            state = await close_now(self.exam_id)
            await self.channel_layer.group_send(self.group, {"type": "exam.event", "payload": state})
        finally:
            timers.pop(self.exam_id, None)


websocket_urlpatterns = [re_path(r"^ws/exams/(?P<exam_id>\d+)/$", ExamConsumer.as_asgi())]
