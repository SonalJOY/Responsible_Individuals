from rest_framework import serializers
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
)


class VolunteerInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerInterest
        fields = '__all__'


class VolunteerOpportunitySerializer(serializers.ModelSerializer):
    focus_area_name = serializers.CharField(source='focus_area.name', read_only=True)
    focus_area_color = serializers.CharField(source='focus_area.color_accent', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = VolunteerOpportunity
        fields = (
            'id', 'title', 'slug', 'focus_area', 'focus_area_name', 'focus_area_color',
            'project', 'project_title', 'location', 'commitment', 'spots_available',
            'spots_filled', 'description', 'responsibilities', 'requirements', 'status',
            'created_at'
        )


class VolunteerProfileSerializer(serializers.ModelSerializer):
    interests_detail = VolunteerInterestSerializer(source='interests', many=True, read_only=True)

    class Meta:
        model = VolunteerProfile
        fields = (
            'id', 'user', 'full_name', 'email', 'phone', 'city', 'state',
            'occupation', 'skills', 'interests', 'interests_detail',
            'availability', 'bio', 'approval_status', 'total_hours_contributed', 'created_at'
        )
        read_only_fields = ('id', 'total_hours_contributed', 'created_at')


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    volunteer_name = serializers.CharField(source='volunteer_profile.full_name', read_only=True)
    volunteer_email = serializers.CharField(source='volunteer_profile.email', read_only=True)

    class Meta:
        model = VolunteerApplication
        fields = (
            'id', 'opportunity', 'opportunity_title', 'volunteer_profile',
            'volunteer_name', 'volunteer_email', 'statement_of_purpose',
            'experience', 'status', 'review_notes', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class VolunteerParticipationSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer_profile.full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = VolunteerParticipation
        fields = ('id', 'volunteer_profile', 'volunteer_name', 'project', 'project_title', 'date', 'hours', 'activity_performed', 'verified', 'created_at')
