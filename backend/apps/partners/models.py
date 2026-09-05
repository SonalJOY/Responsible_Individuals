from django.db import models
from apps.core.models import TimeStampedModel
from apps.projects.models import Project


class Partner(TimeStampedModel):
    class PartnerType(models.TextChoices):
        CSR = 'CSR', 'Corporate / CSR Partner'
        NGO = 'NGO', 'Non-Profit / NGO'
        GOVERNMENT = 'GOVERNMENT', 'Government / Municipal'
        ACADEMIC = 'ACADEMIC', 'Academic / Research Institution'
        COMMUNITY = 'COMMUNITY', 'Citizen / Resident Group'

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    partner_type = models.CharField(max_length=30, choices=PartnerType.choices, default=PartnerType.CSR)
    website = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='partners/logos/', blank=True, null=True)
    description = models.TextField(blank=True)
    since_year = models.PositiveIntegerField(default=2024)
    featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['-featured', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_partner_type_display()})"


class PartnerEnquiry(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New Lead'
        CONTACTED = 'CONTACTED', 'Contacted'
        IN_REVIEW = 'IN_REVIEW', 'Proposal in Review'
        CONVERTED = 'CONVERTED', 'Converted Partner'
        CLOSED = 'CLOSED', 'Closed'

    org_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    org_type = models.CharField(max_length=50, default='Corporate / CSR')
    area_of_interest = models.CharField(max_length=200, help_text="e.g. Lake Rejuvenation, Education, Afforestation")
    location = models.CharField(max_length=150, blank=True)
    expected_contribution = models.CharField(max_length=150, blank=True, help_text="Grant, CSR funds, Volunteering manpower")
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    admin_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Partner Enquiries'

    def __str__(self):
        return f"{self.org_name} - {self.contact_person}"


class SupportedProject(TimeStampedModel):
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name='supported_projects')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='partner_supporters')
    contribution_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    contribution_type = models.CharField(max_length=100, default='CSR Grant')
    year = models.PositiveIntegerField(default=2026)

    def __str__(self):
        return f"{self.partner.name} supporting {self.project.title}"
