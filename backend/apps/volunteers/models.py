import uuid
from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.impact.models import ImpactArea
from apps.projects.models import Project


class VolunteerInterest(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class VolunteerOpportunity(TimeStampedModel):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open for Applications'
        FILLED = 'FILLED', 'Filled'
        CLOSED = 'CLOSED', 'Closed'

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    focus_area = models.ForeignKey(ImpactArea, on_delete=models.SET_NULL, null=True, blank=True, related_name='volunteer_opportunities')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='volunteer_opportunities')

    location = models.CharField(max_length=200, help_text="e.g. Bengaluru, Remote, On-site")
    commitment = models.CharField(max_length=100, help_text="e.g. 4 hours/weekend, 10 hours/week")
    spots_available = models.PositiveIntegerField(default=10)
    spots_filled = models.PositiveIntegerField(default=0)

    description = models.TextField()
    responsibilities = models.TextField()
    requirements = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Volunteer Opportunities'

    def __str__(self):
        return self.title


class VolunteerProfile(TimeStampedModel):
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Verification'
        APPROVED = 'APPROVED', 'Verified & Active'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_profile',
        null=True,
        blank=True
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    skills = models.CharField(max_length=255, help_text="Comma-separated skills")
    interests = models.ManyToManyField(VolunteerInterest, blank=True, related_name='volunteers')
    availability = models.CharField(max_length=100, help_text="e.g. Weekends, Weekdays, Evenings")
    bio = models.TextField(blank=True)
    approval_status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.APPROVED)
    total_hours_contributed = models.DecimalField(max_digits=8, decimal_places=1, default=0.0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class VolunteerApplication(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        APPROVED = 'APPROVED', 'Accepted'
        REJECTED = 'REJECTED', 'Declined'

    opportunity = models.ForeignKey(VolunteerOpportunity, on_delete=models.CASCADE, related_name='applications')
    volunteer_profile = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE, related_name='applications')
    statement_of_purpose = models.TextField()
    experience = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    review_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('opportunity', 'volunteer_profile')

    def __str__(self):
        return f"{self.volunteer_profile.full_name} -> {self.opportunity.title}"


class VolunteerParticipation(TimeStampedModel):
    volunteer_profile = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE, related_name='participations')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='volunteer_participations')
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=1)
    activity_performed = models.CharField(max_length=255)
    verified = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.volunteer_profile.full_name} - {self.hours} hrs on {self.date}"
