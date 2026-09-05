from rest_framework import serializers
from .models import JobPost, JobApplication


class JobPostSerializer(serializers.ModelSerializer):
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = JobPost
        fields = (
            'id', 'title', 'slug', 'department', 'job_type', 'job_type_display',
            'location', 'experience_required', 'description', 'responsibilities',
            'requirements', 'deadline', 'applications_count', 'created_at'
        )


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_post.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = (
            'id', 'job_post', 'job_title', 'applicant_name', 'email', 'phone',
            'resume', 'resume_url', 'linkedin_url', 'cover_letter', 'status',
            'notes', 'created_at'
        )
        read_only_fields = ('id', 'status', 'notes', 'created_at')
