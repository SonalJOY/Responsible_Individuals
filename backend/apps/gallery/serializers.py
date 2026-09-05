from rest_framework import serializers
from .models import GalleryAlbum, GalleryItem


class GalleryItemSerializer(serializers.ModelSerializer):
    album_title = serializers.CharField(source='album.title', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = GalleryItem
        fields = (
            'id', 'album', 'album_title', 'project', 'project_title',
            'title', 'media_type', 'image', 'video_url', 'location',
            'photographer', 'tags', 'created_at'
        )


class GalleryAlbumSerializer(serializers.ModelSerializer):
    items = GalleryItemSerializer(many=True, read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = GalleryAlbum
        fields = ('id', 'title', 'slug', 'description', 'cover_image', 'items_count', 'items', 'created_at')
