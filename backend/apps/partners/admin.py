from django.contrib import admin
from .models import Partner, PartnerEnquiry, SupportedProject


class SupportedProjectInline(admin.TabularInline):
    model = SupportedProject
    extra = 1


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    inlines = [SupportedProjectInline]
    list_display = ('name', 'partner_type', 'since_year', 'featured', 'website')
    list_filter = ('partner_type', 'featured')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(PartnerEnquiry)
class PartnerEnquiryAdmin(admin.ModelAdmin):
    list_display = ('org_name', 'contact_person', 'email', 'phone', 'org_type', 'status', 'created_at')
    list_filter = ('status', 'org_type')
    search_fields = ('org_name', 'contact_person', 'email')
