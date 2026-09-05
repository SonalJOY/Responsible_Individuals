from rest_framework import serializers
from .models import ContactEnquiry, NewsletterSubscriber


class ContactEnquirySerializer(serializers.ModelSerializer):
    department_display = serializers.CharField(source='get_department_display', read_only=True)

    class Meta:
        model = ContactEnquiry
        fields = ('id', 'name', 'email', 'phone', 'department', 'department_display', 'subject', 'message', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ('id', 'email', 'created_at')
