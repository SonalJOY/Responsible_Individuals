from django.db import models
from apps.core.models import TimeStampedModel


class ContactEnquiry(TimeStampedModel):
    class Department(models.TextChoices):
        GENERAL = 'GENERAL', 'General Enquiry'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer Opportunities'
        DONATION = 'DONATION', 'Donations & Giving'
        CSR = 'CSR', 'Corporate & CSR Partnerships'
        MEDIA = 'MEDIA', 'Press & Media'
        PROJECT = 'PROJECT', 'Project Collaboration'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=30, choices=Department.choices, default=Department.GENERAL)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    admin_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Contact Enquiries'

    def __str__(self):
        return f"{self.name} - {self.subject} ({self.get_department_display()})"


class NewsletterSubscriber(TimeStampedModel):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email
