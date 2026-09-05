from django.db import models
from apps.core.models import TimeStampedModel
from apps.projects.models import Project


class GalleryAlbum(TimeStampedModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='gallery/covers/', blank=True, null=True)

    def __str__(self):
        return self.title


class GalleryItem(TimeStampedModel):
    class MediaType(models.TextChoices):
        IMAGE = 'IMAGE', 'Photo'
        VIDEO = 'VIDEO', 'Video'

    album = models.ForeignKey(GalleryAlbum, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='gallery_items')
    title = models.CharField(max_length=200)
    media_type = models.CharField(max_length=10, choices=MediaType.choices, default=MediaType.IMAGE)
    image = models.ImageField(upload_to='gallery/photos/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=150, blank=True)
    photographer = models.CharField(max_length=100, blank=True)
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
