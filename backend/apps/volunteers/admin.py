from django.contrib import admin
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
)


@admin.register(VolunteerOpportunity)
class VolunteerOpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'focus_area', 'location', 'spots_available', 'spots_filled', 'status')
    list_filter = ('status', 'focus_area')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'city', 'approval_status', 'total_hours_contributed')
    list_filter = ('approval_status', 'city')
    search_fields = ('full_name', 'email', 'phone')


@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ('volunteer_profile', 'opportunity', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(VolunteerInterest)
class VolunteerInterestAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(VolunteerParticipation)
class VolunteerParticipationAdmin(admin.ModelAdmin):
    list_display = ('volunteer_profile', 'project', 'date', 'hours', 'verified')
