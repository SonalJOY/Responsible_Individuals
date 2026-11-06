from django.contrib import admin
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
    VolunteerOnboardingApplication,
    VolunteerInvitationBatch,
    VolunteerInvitation,
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
    list_filter = ('verified', 'date')
    search_fields = ('volunteer_profile__full_name', 'activity_performed')


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_code', 'volunteer_profile', 'title', 'issue_date', 'hours_recognized', 'status')
    list_filter = ('status', 'issue_date')
    search_fields = ('certificate_code', 'volunteer_profile__full_name', 'volunteer_profile__email', 'title')


@admin.register(VolunteerOnboardingApplication)
class VolunteerOnboardingApplicationAdmin(admin.ModelAdmin):
    list_display = ('volunteer_profile', 'status', 'submitted_at', 'reviewed_by', 'reviewed_at')
    list_filter = ('status', 'submitted_at')
    search_fields = ('volunteer_profile__full_name', 'volunteer_profile__email', 'volunteer_profile__phone')
    readonly_fields = ('submitted_at', 'created_at', 'updated_at')


@admin.register(VolunteerInvitationBatch)
class VolunteerInvitationBatchAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'status', 'total_rows', 'valid_rows', 'uploaded_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('file_name', 'uploaded_by__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VolunteerInvitation)
class VolunteerInvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'status', 'expires_at', 'batch', 'email_sent', 'created_at')
    list_filter = ('status', 'email_sent', 'expires_at')
    search_fields = ('email', 'batch__file_name')
    readonly_fields = ('token_hash', 'accepted_at', 'created_at', 'updated_at')
