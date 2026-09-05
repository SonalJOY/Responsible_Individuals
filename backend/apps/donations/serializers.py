import uuid
from rest_framework import serializers
from .models import Campaign, Donor, Donation


class CampaignSerializer(serializers.ModelSerializer):
    focus_area_name = serializers.CharField(source='focus_area.name', read_only=True)
    focus_area_color = serializers.CharField(source='focus_area.color_accent', read_only=True)
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Campaign
        fields = (
            'id', 'title', 'slug', 'focus_area', 'focus_area_name', 'focus_area_color',
            'project', 'description', 'goal_amount', 'raised_amount', 'donors_count',
            'progress_percentage', 'start_date', 'end_date', 'cover_image', 'featured'
        )


class DonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = (
            'id', 'full_name', 'email', 'phone', 'pan_number', 'address',
            'city', 'state', 'country', 'postal_code', 'is_anonymous'
        )


class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.full_name', read_only=True)
    donor_email = serializers.CharField(source='donor.email', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = Donation
        fields = (
            'id', 'donor', 'donor_name', 'donor_email', 'campaign', 'campaign_title',
            'project', 'amount', 'currency', 'frequency', 'payment_method',
            'transaction_id', 'order_id', 'status', 'receipt_number',
            'tax_exempt_80g', 'notes', 'created_at'
        )
        read_only_fields = ('id', 'receipt_number', 'created_at')


class CreateDonationSerializer(serializers.Serializer):
    # Donor info
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    pan_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    is_anonymous = serializers.BooleanField(default=False)

    # Donation info
    campaign_id = serializers.UUIDField(required=False, allow_null=True)
    project_id = serializers.UUIDField(required=False, allow_null=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(default='INR')
    frequency = serializers.ChoiceField(choices=Donation.Frequency.choices, default=Donation.Frequency.ONETIME)
    payment_method = serializers.CharField(default='UPI / Online')

    def create(self, validated_data):
        donor_data = {
            'full_name': validated_data['full_name'],
            'email': validated_data['email'],
            'phone': validated_data['phone'],
            'pan_number': validated_data.get('pan_number', ''),
            'city': validated_data.get('city', ''),
            'is_anonymous': validated_data.get('is_anonymous', False),
        }

        donor, _ = Donor.objects.get_or_create(email=donor_data['email'], defaults=donor_data)
        for key, val in donor_data.items():
            if val:
                setattr(donor, key, val)
        donor.save()

        campaign = None
        if validated_data.get('campaign_id'):
            campaign = Campaign.objects.filter(id=validated_data['campaign_id']).first()

        project = None
        if validated_data.get('project_id'):
            from apps.projects.models import Project
            project = Project.objects.filter(id=validated_data['project_id']).first()

        tx_id = f"PAY-{uuid.uuid4().hex[:12].upper()}"

        donation = Donation.objects.create(
            donor=donor,
            campaign=campaign,
            project=project,
            amount=validated_data['amount'],
            currency=validated_data.get('currency', 'INR'),
            frequency=validated_data.get('frequency', Donation.Frequency.ONETIME),
            payment_method=validated_data.get('payment_method', 'UPI / Online'),
            transaction_id=tx_id,
            status=Donation.Status.SUCCESS,
        )

        if campaign:
            campaign.raised_amount += donation.amount
            campaign.donors_count += 1
            campaign.save()

        if project:
            project.raised_amount += donation.amount
            project.save()

        return donation
