from django.contrib import admin
from .models import Story, StoryCategory


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'beneficiary_name', 'focus_area', 'featured', 'published_date')
    list_filter = ('featured', 'focus_area', 'category')
    search_fields = ('title', 'beneficiary_name', 'location')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(StoryCategory)
class StoryCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
