from django.db import models
from apps.core.models import TimeStampedModel


class JobPost(TimeStampedModel):
    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        FELLOWSHIP = 'FELLOWSHIP', 'Fellowship'

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    department = models.CharField(max_length=100, help_text="e.g. Programs, Operations, Impact, Technology")
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    location = models.CharField(max_length=100, default='Bengaluru / Hybrid')
    experience_required = models.CharField(max_length=100, default='1-3 years')

    description = models.TextField()
    responsibilities = models.TextField()
    requirements = models.TextField()

    deadline = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_job_type_display()})"


class JobApplication(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        REVIEWING = 'REVIEWING', 'Under Review'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        REJECTED = 'REJECTED', 'Rejected'
        HIRED = 'HIRED', 'Hired'

    job_post = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    applicant_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    resume_url = models.URLField(blank=True, null=True, help_text="Link to Google Drive / LinkedIn resume")
    linkedin_url = models.URLField(blank=True, null=True)
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.applicant_name} for {self.job_post.title}"
