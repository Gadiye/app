from django.contrib import admin
from .models import Job, JobItem, ServiceRate

admin.site.register(Job)
admin.site.register(JobItem)
admin.site.register(ServiceRate)
