from rest_framework import serializers
from .models import Event, EventRegistration


class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ('id', 'event', 'name', 'email', 'phone', 'is_volunteer', 'notes', 'attended', 'created_at')
        read_only_fields = ('id', 'attended', 'created_at')


class EventSerializer(serializers.ModelSerializer):
    focus_area_name = serializers.CharField(source='focus_area.name', read_only=True)
    focus_area_color = serializers.CharField(source='focus_area.color_accent', read_only=True)
    is_full = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = (
            'id', 'title', 'slug', 'focus_area', 'focus_area_name', 'focus_area_color',
            'description', 'date', 'start_time', 'end_time', 'venue', 'city', 'address',
            'capacity', 'registered_count', 'is_full', 'status', 'cover_image',
            'outcome_summary', 'volunteers_attended', 'created_at'
        )
        read_only_fields = ('id', 'registered_count', 'created_at')
