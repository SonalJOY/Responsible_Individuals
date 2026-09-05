from django.db import models
from apps.core.models import TimeStampedModel
from apps.impact.models import ImpactArea


class Event(TimeStampedModel):
    class Status(models.TextChoices):
        UPCOMING = 'UPCOMING', 'Upcoming'
        ONGOING = 'ONGOING', 'Ongoing'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    focus_area = models.ForeignKey(ImpactArea, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    description = models.TextField()
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    venue = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(default=100)
    registered_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING, db_index=True)
    cover_image = models.ImageField(upload_to='events/covers/', blank=True, null=True)
    outcome_summary = models.TextField(blank=True, help_text="Impact summary after event concludes")
    volunteers_attended = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-date', 'start_time']

    def __str__(self):
        return f"{self.title} ({self.date})"

    @property
    def is_full(self):
        return self.registered_count >= self.capacity


class EventRegistration(TimeStampedModel):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    is_volunteer = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    attended = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('event', 'email')

    def __str__(self):
        return f"{self.name} for {self.event.title}"
