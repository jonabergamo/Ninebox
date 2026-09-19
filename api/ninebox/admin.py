from django.contrib import admin

from .models import Activity, Class, Grid, Placement, Subject, Submission, User

admin.site.register([User, Class, Subject, Grid, Activity, Submission, Placement])
