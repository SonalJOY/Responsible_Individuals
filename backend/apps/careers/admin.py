from django.contrib import admin
from .models import JobPost, JobApplication


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'job_type', 'location', 'deadline')
    list_filter = ('job_type', 'department')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant_name', 'email', 'phone', 'job_post', 'status', 'created_at')
    list_filter = ('status', 'job_post')
    search_fields = ('applicant_name', 'email', 'phone')
