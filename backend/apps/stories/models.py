from django.db import models
from apps.core.models import TimeStampedModel
from apps.impact.models import ImpactArea
from apps.projects.models import Project


class StoryCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = 'Story Categories'

    def __str__(self):
        return self.name


class Story(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    category = models.ForeignKey(StoryCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='stories')
    focus_area = models.ForeignKey(ImpactArea, on_delete=models.SET_NULL, null=True, blank=True, related_name='stories')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='stories')

    beneficiary_name = models.CharField(max_length=150, help_text="Individual, family, or community name")
    location = models.CharField(max_length=150)

    # Narrative structure: Problem -> Intervention -> Outcome
    challenge = models.TextField(help_text="The background challenge faced by the community")
    intervention = models.TextField(help_text="The action and support provided")
    outcome = models.TextField(help_text="Measurable change and current situation")

    quote = models.TextField(blank=True, help_text="Direct quote from beneficiary or community leader")
    quote_author = models.CharField(max_length=150, blank=True)

    cover_image = models.ImageField(upload_to='stories/covers/', blank=True, null=True)
    before_image = models.ImageField(upload_to='stories/before_after/', blank=True, null=True)
    after_image = models.ImageField(upload_to='stories/before_after/', blank=True, null=True)

    featured = models.BooleanField(default=False, db_index=True)
    published_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-featured', '-published_date']
        verbose_name_plural = 'Stories'

    def __str__(self):
        return self.title
