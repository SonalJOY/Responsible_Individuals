from django.contrib import admin
from .models import Event, EventRegistration


class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    inlines = [EventRegistrationInline]
    list_display = ('title', 'date', 'venue', 'city', 'capacity', 'registered_count', 'status')
    list_filter = ('status', 'date', 'city', 'focus_area')
    search_fields = ('title', 'venue', 'city')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'event', 'attended', 'is_volunteer', 'created_at')
    list_filter = ('attended', 'is_volunteer', 'event')
    search_fields = ('name', 'email', 'phone')
