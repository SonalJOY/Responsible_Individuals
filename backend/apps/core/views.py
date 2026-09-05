from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from apps.accounts.permissions import IsAdminUserOrStaff
from apps.projects.models import Project
from apps.volunteers.models import VolunteerProfile, VolunteerApplication
from apps.donations.models import Donation
from apps.events.models import Event, EventRegistration
from apps.contact.models import ContactEnquiry
from apps.partners.models import PartnerEnquiry


class AdminDashboardStatsView(APIView):
    """Aggregates executive operational KPIs for the Admin Dashboard."""
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        total_projects = Project.objects.filter(is_active=True).count()
        active_projects = Project.objects.filter(is_active=True, status=Project.Status.IN_PROGRESS).count()

        total_volunteers = VolunteerProfile.objects.filter(is_active=True).count()
        pending_volunteers = VolunteerApplication.objects.filter(status=VolunteerApplication.Status.PENDING).count()

        donations_total = Donation.objects.filter(status=Donation.Status.SUCCESS).aggregate(total=Sum('amount'))['total'] or 0
        donations_count = Donation.objects.filter(status=Donation.Status.SUCCESS).count()

        beneficiaries_total = Project.objects.filter(is_active=True).aggregate(total=Sum('beneficiaries_count'))['total'] or 0

        upcoming_events = Event.objects.filter(status=Event.Status.UPCOMING).count()
        pending_enquiries = ContactEnquiry.objects.filter(status=ContactEnquiry.Status.NEW).count()
        pending_partners = PartnerEnquiry.objects.filter(status=PartnerEnquiry.Status.NEW).count()

        # Recent 5 donations
        recent_donations = list(Donation.objects.filter(status=Donation.Status.SUCCESS).order_by('-created_at')[:5].values(
            'id', 'receipt_number', 'amount', 'donor__full_name', 'created_at'
        ))

        # Recent 5 applications
        recent_applications = list(VolunteerApplication.objects.order_by('-created_at')[:5].values(
            'id', 'volunteer_profile__full_name', 'opportunity__title', 'status', 'created_at'
        ))

        # Recent 5 enquiries
        recent_enquiries = list(ContactEnquiry.objects.order_by('-created_at')[:5].values(
            'id', 'name', 'department', 'subject', 'status', 'created_at'
        ))

        return Response({
            'kpis': {
                'total_projects': total_projects,
                'active_projects': active_projects,
                'total_volunteers': total_volunteers,
                'pending_volunteers': pending_volunteers,
                'donations_amount': float(donations_total),
                'donations_count': donations_count,
                'beneficiaries_reached': beneficiaries_total,
                'upcoming_events': upcoming_events,
                'pending_enquiries': pending_enquiries,
                'pending_partners': pending_partners,
            },
            'recent_donations': recent_donations,
            'recent_applications': recent_applications,
            'recent_enquiries': recent_enquiries,
        })
