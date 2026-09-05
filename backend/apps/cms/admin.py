from django.contrib import admin
from .models import Page, PageSection, HeroBanner, SiteSetting


class PageSectionInline(admin.StackedInline):
    model = PageSection
    extra = 1


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    inlines = [PageSectionInline]
    list_display = ('title', 'slug', 'published', 'created_at')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'badge_text', 'order', 'created_at')


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description')
