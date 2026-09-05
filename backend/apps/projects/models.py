from django.db import models
from apps.core.models import TimeStampedModel
from apps.impact.models import ImpactArea


class ProjectCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Project Categories'

    def __str__(self):
        return self.name


class Project(TimeStampedModel):
    class Status(models.TextChoices):
        PLANNING = 'PLANNING', 'Need Assessment & Design'
        FUNDING = 'FUNDING', 'Partner & Funding Alignment'
        IN_PROGRESS = 'IN_PROGRESS', 'Implementation & Ongoing'
        COMPLETED = 'COMPLETED', 'Completed & Measured'
        SUSTAINED = 'SUSTAINED', 'Sustained & Replicating'

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    category = models.ForeignKey(ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    focus_area = models.ForeignKey(ImpactArea, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.IN_PROGRESS, db_index=True)
    location = models.CharField(max_length=200, help_text="City, State, Region")
    coordinates = models.CharField(max_length=100, blank=True, help_text="lat,lng")

    summary = models.TextField(help_text="Concise high-level summary for card previews")
    description = models.TextField(help_text="Detailed project description")
    problem_statement = models.TextField(blank=True, help_text="The community challenge addressed")
    solution_approach = models.TextField(blank=True, help_text="Intervention and methodology")

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    beneficiaries_count = models.PositiveIntegerField(default=0, help_text="Total direct beneficiaries")

    cover_image = models.ImageField(upload_to='projects/covers/', blank=True, null=True)
    featured = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['-featured', '-start_date']

    def __str__(self):
        return self.title

    @property
    def progress_percentage(self):
        if self.budget > 0:
            return min(round(float(self.raised_amount / self.budget) * 100, 1), 100.0)
        return 0.0


class ProjectObjective(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='objectives')
    title = models.CharField(max_length=255)
    target = models.CharField(max_length=150, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.project.title} - {self.title}"


class ProjectActivity(TimeStampedModel):
    class ActivityStatus(models.TextChoices):
        UPCOMING = 'UPCOMING', 'Upcoming'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=ActivityStatus.choices, default=ActivityStatus.IN_PROGRESS)
    date = models.DateField(null=True, blank=True)
    outcome = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-date', 'created_at']

    def __str__(self):
        return f"{self.project.title} - {self.title}"


class ProjectKPI(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='kpis')
    metric_name = models.CharField(max_length=150)
    unit = models.CharField(max_length=50, blank=True)
    baseline = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    achieved = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.project.title} - {self.metric_name}: {self.achieved}/{self.target} {self.unit}"


class ProjectPartner(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='partners')
    partner_name = models.CharField(max_length=200)
    role = models.CharField(max_length=150, help_text="e.g. Funding Partner, Implementation Partner")
    logo = models.ImageField(upload_to='projects/partners/', blank=True, null=True)

    def __str__(self):
        return f"{self.partner_name} ({self.role}) on {self.project.title}"


class ProjectMedia(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='media')
    caption = models.CharField(max_length=255, blank=True)
    media_file = models.ImageField(upload_to='projects/gallery/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    is_cover = models.BooleanField(default=False)

    def __str__(self):
        return f"Media for {self.project.title}"
