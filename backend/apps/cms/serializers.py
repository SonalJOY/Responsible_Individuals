from rest_framework import serializers
from .models import Page, PageSection, HeroBanner, SiteSetting


class PageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSection
        fields = ('id', 'section_key', 'title', 'subtitle', 'content', 'media_url', 'cta_text', 'cta_url', 'order', 'metadata')


class PageSerializer(serializers.ModelSerializer):
    sections = PageSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = ('id', 'slug', 'title', 'subtitle', 'meta_title', 'meta_description', 'published', 'sections')


class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = '__all__'


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ('key', 'value', 'description')
