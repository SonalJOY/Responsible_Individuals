from django.db import models
from apps.core.models import TimeStampedModel


class SiteSetting(TimeStampedModel):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.key}: {self.value[:30]}"


class HeroBanner(TimeStampedModel):
    title = models.CharField(max_length=255)
    subtitle = models.TextField()
    badge_text = models.CharField(max_length=100, default="Responsible Individuals")
    primary_btn_text = models.CharField(max_length=50, default="Explore Our Work")
    primary_btn_url = models.CharField(max_length=200, default="/projects")
    secondary_btn_text = models.CharField(max_length=50, default="Get Involved")
    secondary_btn_url = models.CharField(max_length=200, default="/volunteer")
    background_image = models.ImageField(upload_to='banners/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class Page(TimeStampedModel):
    slug = models.SlugField(unique=True, max_length=150)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class PageSection(TimeStampedModel):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='sections')
    section_key = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True)
    media_url = models.URLField(blank=True, null=True)
    cta_text = models.CharField(max_length=50, blank=True)
    cta_url = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ('page', 'section_key')

    def __str__(self):
        return f"{self.page.title} - {self.section_key}"
