from django.contrib import admin
from .models import (
    ProjectCategory,
    Project,
    ProjectObjective,
    ProjectActivity,
    ProjectKPI,
    ProjectPartner,
    ProjectMedia,
)


class ProjectObjectiveInline(admin.TabularInline):
    model = ProjectObjective
    extra = 1


class ProjectActivityInline(admin.TabularInline):
    model = ProjectActivity
    extra = 1


class ProjectKPIInline(admin.TabularInline):
    model = ProjectKPI
    extra = 1


class ProjectPartnerInline(admin.TabularInline):
    model = ProjectPartner
    extra = 1


class ProjectMediaInline(admin.TabularInline):
    model = ProjectMedia
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = [
        ProjectObjectiveInline,
        ProjectActivityInline,
        ProjectKPIInline,
        ProjectPartnerInline,
        ProjectMediaInline,
    ]
    list_display = ('title', 'focus_area', 'status', 'location', 'budget', 'raised_amount', 'featured', 'start_date')
    list_filter = ('status', 'featured', 'focus_area', 'category')
    search_fields = ('title', 'location', 'summary')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
