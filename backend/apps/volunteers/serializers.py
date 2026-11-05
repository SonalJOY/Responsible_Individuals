from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
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
            'availability', 'bio', 'approval_status', 'is_active',
            'registration_source',
            'total_hours_contributed', 'certificates_count', 'created_at'
        )
        read_only_fields = ('id', 'email', 'approval_status', 'is_active', 'registration_source', 'total_hours_contributed', 'created_at', 'user')


class VolunteerActiveStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(
        required=True,
        error_messages={'required': 'The is_active field is required.'}
    )
    reason = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        min_length=5,
        max_length=500,
        error_messages={
            'required': 'A reason is required for updating active status.',
            'blank': 'A reason is required for updating active status.',
            'min_length': 'Reason must be at least 5 characters long.',
        }
    )

    def validate_reason(self, value):
        cleaned = value.strip()
        if len(cleaned) < 5:
            raise serializers.ValidationError('Reason must contain at least 5 characters of meaningful text.')
        return cleaned


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


class VolunteerOnboardingApplicationSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer_profile.full_name', read_only=True)
    volunteer_email = serializers.CharField(source='volunteer_profile.email', read_only=True)
    volunteer_phone = serializers.CharField(source='volunteer_profile.phone', read_only=True)
    volunteer_city = serializers.CharField(source='volunteer_profile.city', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)

    class Meta:
        model = VolunteerOnboardingApplication
        fields = (
            'id', 'volunteer_profile', 'volunteer_name', 'volunteer_email',
            'volunteer_phone', 'volunteer_city',
            'statement_of_intent', 'skills_summary', 'experience_summary',
            'availability', 'status', 'submitted_at', 'reviewed_at',
            'reviewed_by', 'reviewed_by_name', 'admin_review_notes',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'volunteer_profile', 'status', 'submitted_at',
            'reviewed_at', 'reviewed_by', 'admin_review_notes',
            'created_at', 'updated_at'
        )


class VolunteerOnboardingSubmitSerializer(serializers.Serializer):
    statement_of_intent = serializers.CharField(
        min_length=20,
        error_messages={'min_length': 'Please write at least 20 characters explaining your motivation to volunteer.'}
    )
    skills_summary = serializers.CharField(required=False, allow_blank=True, default='')
    experience_summary = serializers.CharField(required=False, allow_blank=True, default='')
    availability = serializers.CharField(required=False, allow_blank=True, default='Weekends')
    phone = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        if value and value.strip():
            return validate_indian_phone(value)
        return value


class VolunteerOnboardingReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    review_notes = serializers.CharField(required=False, allow_blank=True, default='')


# =============================================================================
# VOLUNTEER INVITATION SERIALIZERS (Phase 2.3)
# =============================================================================

class VolunteerInvitationBatchListSerializer(serializers.ModelSerializer):
    """
    Lightweight list serializer for invitation batches.
    Excludes the detailed 'summary' JSON to minimize personal data exposure on collection listings.
    """
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)

    class Meta:
        model = VolunteerInvitationBatch
        fields = (
            'id',
            'file_name',
            'uploaded_by',
            'uploaded_by_email',
            'total_rows',
            'valid_rows',
            'duplicate_rows',
            'rejected_rows',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class VolunteerInvitationBatchSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)

    class Meta:
        model = VolunteerInvitationBatch
        fields = (
            'id',
            'file_name',
            'uploaded_by',
            'uploaded_by_email',
            'total_rows',
            'valid_rows',
            'duplicate_rows',
            'rejected_rows',
            'status',
            'summary',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class VolunteerInvitationSerializer(serializers.ModelSerializer):
    invited_by_email = serializers.EmailField(source='invited_by.email', read_only=True)
    batch_file_name = serializers.CharField(source='batch.file_name', read_only=True)

    class Meta:
        model = VolunteerInvitation
        fields = (
            'id',
            'batch',
            'batch_file_name',
            'email',
            'status',
            'expires_at',
            'invited_by',
            'invited_by_email',
            'accepted_at',
            'volunteer_profile',
            'email_sent',
            'email_sent_at',
            'email_error',
            'created_at',
            'updated_at',
        )
        # Note: token_hash is strictly excluded to prevent cryptographic material leakage.
        read_only_fields = fields


class CSVInvitationUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)


class IndividualInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ValidateInvitationTokenSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, trim_whitespace=True)


class RequestInvitationOTPSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, trim_whitespace=True)


class AcceptInvitationSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, trim_whitespace=True)
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    confirm_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    occupation = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.CharField(required=False, allow_blank=True)
    availability = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.ListField(child=serializers.CharField(), required=False)
    existing_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    otp_code = serializers.CharField(required=False, allow_blank=True)

