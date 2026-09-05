from django.db import models
from apps.core.models import TimeStampedModel


class ImpactArea(TimeStampedModel):
    slug = models.SlugField(unique=True, max_length=150)
    name = models.CharField(max_length=150)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default='HeartHandshake')
    color_accent = models.CharField(max_length=20, default='#10B981')
    sdg_alignment = models.CharField(max_length=200, blank=True, help_text="e.g. SDG 4: Quality Education, SDG 13: Climate Action")
    cover_image = models.ImageField(upload_to='impact_areas/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class ImpactMetric(TimeStampedModel):
    METRIC_TYPE_CHOICES = [
        ('REACH', 'Reach (People/Communities)'),
        ('PARTICIPATION', 'Participation (Volunteers/Events)'),
        ('OUTPUT', 'Output (Trees, Classrooms, Activities)'),
        ('OUTCOME', 'Outcome (Transformation/Improvement)'),
        ('FINANCIAL', 'Financial (Funds Deployed)'),
    ]

    impact_area = models.ForeignKey(ImpactArea, on_delete=models.CASCADE, related_name='metrics')
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPE_CHOICES, default='OUTPUT')
    name = models.CharField(max_length=150)
    unit = models.CharField(max_length=50, blank=True)
    baseline_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    achieved_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.impact_area.name} - {self.name}: {self.achieved_value} {self.unit}"


class ImpactStatistic(TimeStampedModel):
    """Headline counters for homepage & executive dashboard."""
    key = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=100)
    counter_value = models.CharField(max_length=50, help_text="e.g. 50+, 120+, 50,000+, 2,500+")
    raw_number = models.BigIntegerField(default=0)
    suffix = models.CharField(max_length=20, blank=True, default='+')
    icon_name = models.CharField(max_length=50, default='Award')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.title}: {self.counter_value}"


class ImpactReport(TimeStampedModel):
    title = models.CharField(max_length=200)
    year = models.IntegerField(default=2026)
    summary = models.TextField()
    cover_image = models.ImageField(upload_to='reports/covers/', blank=True, null=True)
    pdf_file = models.FileField(upload_to='reports/pdfs/', blank=True, null=True)
    published_date = models.DateField(auto_now_add=True)
    download_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-year', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.year})"
