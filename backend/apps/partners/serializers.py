from rest_framework import serializers
from .models import Partner, PartnerEnquiry, SupportedProject


class SupportedProjectSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = SupportedProject
        fields = ('id', 'partner', 'project', 'project_title', 'contribution_amount', 'contribution_type', 'year')


class PartnerSerializer(serializers.ModelSerializer):
    partner_type_display = serializers.CharField(source='get_partner_type_display', read_only=True)
    supported_projects = SupportedProjectSerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = (
            'id', 'name', 'slug', 'partner_type', 'partner_type_display',
            'website', 'logo', 'description', 'since_year', 'featured',
            'supported_projects', 'created_at'
        )


class PartnerEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerEnquiry
        fields = (
            'id', 'org_name', 'contact_person', 'email', 'phone', 'org_type',
            'area_of_interest', 'location', 'expected_contribution', 'message',
            'status', 'admin_notes', 'created_at'
        )
        read_only_fields = ('id', 'status', 'admin_notes', 'created_at')
