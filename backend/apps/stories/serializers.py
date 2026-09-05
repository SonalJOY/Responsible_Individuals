from rest_framework import serializers
from .models import Story, StoryCategory


class StoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryCategory
        fields = '__all__'


class StorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    focus_area_name = serializers.CharField(source='focus_area.name', read_only=True)
    focus_area_color = serializers.CharField(source='focus_area.color_accent', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Story
        fields = (
            'id', 'title', 'slug', 'category', 'category_name',
            'focus_area', 'focus_area_name', 'focus_area_color',
            'project', 'project_title', 'beneficiary_name', 'location',
            'challenge', 'intervention', 'outcome', 'quote', 'quote_author',
            'cover_image', 'before_image', 'after_image', 'featured',
            'published_date', 'created_at'
        )
