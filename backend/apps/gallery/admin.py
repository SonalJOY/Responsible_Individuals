from django.contrib import admin
from .models import GalleryAlbum, GalleryItem


class GalleryItemInline(admin.TabularInline):
    model = GalleryItem
    extra = 1


@admin.register(GalleryAlbum)
class GalleryAlbumAdmin(admin.ModelAdmin):
    inlines = [GalleryItemInline]
    list_display = ('title', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'album', 'media_type', 'location', 'created_at')
    list_filter = ('media_type', 'album')
    search_fields = ('title', 'location', 'tags')
