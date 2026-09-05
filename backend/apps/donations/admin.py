from django.contrib import admin
from .models import Campaign, Donor, Donation


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'focus_area', 'goal_amount', 'raised_amount', 'donors_count', 'featured')
    list_filter = ('featured', 'focus_area')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'city', 'is_anonymous', 'created_at')
    search_fields = ('full_name', 'email', 'phone', 'pan_number')


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'donor', 'amount', 'currency', 'frequency', 'status', 'created_at')
    list_filter = ('status', 'frequency', 'currency')
    search_fields = ('receipt_number', 'transaction_id', 'donor__full_name', 'donor__email')
    readonly_fields = ('receipt_number', 'transaction_id', 'created_at')
