import uuid
from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.impact.models import ImpactArea
from apps.projects.models import Project


class Campaign(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    focus_area = models.ForeignKey(ImpactArea, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns')

    description = models.TextField()
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    donors_count = models.PositiveIntegerField(default=0)

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    cover_image = models.ImageField(upload_to='campaigns/covers/', blank=True, null=True)
    featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['-featured', '-created_at']

    def __str__(self):
        return self.title

    @property
    def progress_percentage(self):
        if self.goal_amount > 0:
            return min(round(float(self.raised_amount / self.goal_amount) * 100, 1), 100.0)
        return 0.0


class Donor(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations_made'
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    pan_number = models.CharField(max_length=20, blank=True, help_text="PAN for 80G tax exemption")
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20, blank=True)
    is_anonymous = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class Donation(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment'
        SUCCESS = 'SUCCESS', 'Completed / Verified'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    class Frequency(models.TextChoices):
        ONETIME = 'ONETIME', 'One-time'
        MONTHLY = 'MONTHLY', 'Monthly'

    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='donations')
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    frequency = models.CharField(max_length=20, choices=Frequency.choices, default=Frequency.ONETIME)

    payment_method = models.CharField(max_length=50, default='UPI/Card')
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    order_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS, db_index=True)

    receipt_number = models.CharField(max_length=50, unique=True, blank=True)
    tax_exempt_80g = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"₹{self.amount} by {self.donor.full_name} ({self.receipt_number or self.transaction_id})"

    def save(self, *args, **kwargs):
        if not self.receipt_number and self.status == self.Status.SUCCESS:
            import random
            from django.utils import timezone
            year = timezone.now().year
            rand_suffix = str(random.randint(10000, 99999))
            self.receipt_number = f"RI-{year}-{rand_suffix}"
        super().save(*args, **kwargs)
