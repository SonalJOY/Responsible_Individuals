from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import (
    VolunteerInterest,
    VolunteerOpportunity,
    VolunteerProfile,
    VolunteerApplication,
    VolunteerParticipation,
    Certificate,
)
from .validators import (
    validate_indian_phone,
    validate_email_address,
    validate_strong_password,
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
    certificates_count = serializers.IntegerField(source='certificates.count', read_only=True)

    class Meta:
        model = VolunteerProfile
        fields = (
            'id', 'user', 'full_name', 'email', 'phone', 'city', 'state',
            'occupation', 'skills', 'interests', 'interests_detail',
            'availability', 'bio', 'approval_status', 'total_hours_contributed',
            'certificates_count', 'created_at'
        )
        read_only_fields = ('id', 'total_hours_contributed', 'created_at', 'user')


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    opportunity_slug = serializers.CharField(source='opportunity.slug', read_only=True)
    opportunity_location = serializers.CharField(source='opportunity.location', read_only=True)
    opportunity_commitment = serializers.CharField(source='opportunity.commitment', read_only=True)
    focus_area_name = serializers.CharField(source='opportunity.focus_area.name', read_only=True)
    volunteer_name = serializers.CharField(source='volunteer_profile.full_name', read_only=True)
    volunteer_email = serializers.CharField(source='volunteer_profile.email', read_only=True)

    class Meta:
        model = VolunteerApplication
        fields = (
            'id', 'opportunity', 'opportunity_title', 'opportunity_slug',
            'opportunity_location', 'opportunity_commitment', 'focus_area_name',
            'volunteer_profile', 'volunteer_name', 'volunteer_email',
            'statement_of_purpose', 'experience', 'status', 'review_notes', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class VolunteerParticipationSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer_profile.full_name', read_only=True)
    volunteer_email = serializers.CharField(source='volunteer_profile.email', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = VolunteerParticipation
        fields = (
            'id', 'volunteer_profile', 'volunteer_name', 'volunteer_email',
            'project', 'project_title', 'date', 'hours', 'activity_performed',
            'verified', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class CertificateSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer_profile.full_name', read_only=True)
    volunteer_email = serializers.CharField(source='volunteer_profile.email', read_only=True)

    class Meta:
        model = Certificate
        fields = (
            'id', 'volunteer_profile', 'volunteer_name', 'volunteer_email',
            'certificate_code', 'title', 'description', 'issue_date',
            'hours_recognized', 'status', 'issued_by', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class VolunteerRegistrationSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=254)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    phone = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100, default='Bengaluru')
    state = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    occupation = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    skills = serializers.CharField(max_length=255, required=False, allow_blank=True, default='Community Action')
    availability = serializers.CharField(max_length=100, default='Weekends')
    bio = serializers.CharField(required=False, allow_blank=True, default='')
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def validate_email(self, value):
        return validate_email_address(value)

    def validate_phone(self, value):
        return validate_indian_phone(value)

    def validate_password(self, value):
        return validate_strong_password(value)

    def validate(self, attrs):
        confirm_password = attrs.get('confirm_password')
        if confirm_password and attrs['password'] != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class VolunteerApplySerializer(serializers.Serializer):
    opportunity_id = serializers.UUIDField(required=False)
    opportunity_slug = serializers.CharField(required=False)
    statement_of_purpose = serializers.CharField(min_length=10)
    experience = serializers.CharField(required=False, allow_blank=True, default='')
    skills = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    availability = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        if value and value.strip():
            return validate_indian_phone(value)
        return value

    def validate(self, attrs):
        if not attrs.get('opportunity_id') and not attrs.get('opportunity_slug'):
            raise serializers.ValidationError({"opportunity": "Either opportunity_id or opportunity_slug is required."})
        return attrs

