import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError, Retry

from .models import VolunteerProfile, VolunteerApplication, VolunteerOnboardingApplication

logger = logging.getLogger(__name__)


def _get_contact_email():
    return getattr(
        settings,
        'VOLUNTEER_ADMIN_EMAIL',
        getattr(settings, 'DEFAULT_FROM_EMAIL', 'volunteer-coordinator@responsibleindividuals.org')
    )


def _get_from_email():
    return getattr(settings, 'DEFAULT_FROM_EMAIL', 'Responsible Individuals <noreply@responsibleindividuals.org>')


def _send_templated_email(subject, template_base, context, recipient_list):
    """
    Helper to render HTML and Plaintext email alternatives and dispatch via Django EmailBackend.
    """
    from_email = _get_from_email()
    contact_email = _get_contact_email()
    site_name = getattr(settings, 'SITE_NAME', 'Responsible Individuals')

    merged_context = {
        'subject': subject,
        'contact_email': contact_email,
        'site_name': site_name,
        **context,
    }

    html_content = render_to_string(f"{template_base}.html", merged_context)
    try:
        text_content = render_to_string(f"{template_base}.txt", merged_context)
    except Exception:
        text_content = strip_tags(html_content)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content.strip(),
        from_email=from_email,
        to=recipient_list,
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_volunteer_registration_email(self, volunteer_profile_id):
    """
    Sends registration confirmation email to newly registered volunteer.
    """
    try:
        profile = VolunteerProfile.objects.prefetch_related('interests').filter(id=volunteer_profile_id).first()
        if not profile:
            logger.warning("send_volunteer_registration_email: VolunteerProfile not found for ID %s", volunteer_profile_id)
            return False

        interests_list = ", ".join(profile.interests.values_list('name', flat=True))
        site_name = getattr(settings, 'SITE_NAME', 'Responsible Individuals')
        subject = f"Welcome to {site_name} – Registration Confirmed"

        context = {
            'full_name': profile.full_name,
            'email': profile.email,
            'city': profile.city,
            'state': profile.state,
            'interests_list': interests_list,
        }

        _send_templated_email(
            subject=subject,
            template_base='volunteers/emails/registration_confirmation',
            context=context,
            recipient_list=[profile.email],
        )
        logger.info("Volunteer registration confirmation sent successfully to %s", profile.email)
        return True

    except Retry:
        raise
    except Exception as exc:
        logger.error(
            "Failed sending registration confirmation for profile %s (Attempt %d/%d): %s",
            volunteer_profile_id,
            self.request.retries + 1,
            self.max_retries,
            str(exc)
        )
        try:
            raise self.retry(exc=exc, countdown=min(300, 30 * (2 ** self.request.retries)))
        except MaxRetriesExceededError:
            logger.error("Max retries exceeded sending registration confirmation for profile %s", volunteer_profile_id)
            return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_admin_registration_email(self, volunteer_profile_id):
    """
    Sends notification email to volunteer coordinator/admin about a new volunteer registration.
    """
    try:
        profile = VolunteerProfile.objects.prefetch_related('interests').filter(id=volunteer_profile_id).first()
        if not profile:
            logger.warning("send_admin_registration_email: VolunteerProfile not found for ID %s", volunteer_profile_id)
            return False

        admin_email = getattr(settings, 'VOLUNTEER_ADMIN_EMAIL', 'volunteer-coordinator@responsibleindividuals.org')
        if not admin_email:
            logger.warning("send_admin_registration_email: VOLUNTEER_ADMIN_EMAIL not configured")
            return False

        interests_list = ", ".join(profile.interests.values_list('name', flat=True))
        subject = f"New Volunteer Registered: {profile.full_name}"

        context = {
            'full_name': profile.full_name,
            'email': profile.email,
            'phone': profile.phone,
            'city': profile.city,
            'state': profile.state,
            'occupation': profile.occupation,
            'skills': profile.skills,
            'availability': profile.availability,
            'interests_list': interests_list,
            'registered_at': profile.created_at.strftime('%B %d, %Y at %I:%M %p'),
        }

        _send_templated_email(
            subject=subject,
            template_base='volunteers/emails/admin_new_volunteer',
            context=context,
            recipient_list=[admin_email],
        )
        logger.info("Admin notification for new volunteer %s sent successfully to %s", profile.email, admin_email)
        return True

    except Retry:
        raise
    except Exception as exc:
        logger.error(
            "Failed sending admin notification for profile %s (Attempt %d/%d): %s",
            volunteer_profile_id,
            self.request.retries + 1,
            self.max_retries,
            str(exc)
        )
        try:
            raise self.retry(exc=exc, countdown=min(300, 30 * (2 ** self.request.retries)))
        except MaxRetriesExceededError:
            logger.error("Max retries exceeded sending admin registration notification for profile %s", volunteer_profile_id)
            return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_confirmation_email(self, application_id):
    """
    Sends confirmation email to volunteer upon receiving their application.
    """
    try:
        app = VolunteerApplication.objects.select_related('opportunity', 'volunteer_profile').filter(id=application_id).first()
        if not app:
            logger.warning("send_application_confirmation_email: VolunteerApplication not found for ID %s", application_id)
            return False

        site_name = getattr(settings, 'SITE_NAME', 'Responsible Individuals')
        subject = f"Application Received: {app.opportunity.title} – {site_name}"

        context = {
            'full_name': app.volunteer_profile.full_name,
            'opportunity_title': app.opportunity.title,
            'location': app.opportunity.location,
            'commitment': app.opportunity.commitment,
            'application_date': app.created_at.strftime('%B %d, %Y'),
        }

        _send_templated_email(
            subject=subject,
            template_base='volunteers/emails/application_submitted',
            context=context,
            recipient_list=[app.volunteer_profile.email],
        )
        logger.info("Application confirmation sent successfully for application %s to %s", application_id, app.volunteer_profile.email)
        return True

    except Retry:
        raise
    except Exception as exc:
        logger.error(
            "Failed sending application confirmation for application %s (Attempt %d/%d): %s",
            application_id,
            self.request.retries + 1,
            self.max_retries,
            str(exc)
        )
        try:
            raise self.retry(exc=exc, countdown=min(300, 30 * (2 ** self.request.retries)))
        except MaxRetriesExceededError:
            logger.error("Max retries exceeded sending application confirmation for application %s", application_id)
            return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_status_email(self, application_id, status):
    """
    Sends status update email (Approved / Rejected / Waitlisted) to volunteer.
    """
    try:
        app = VolunteerApplication.objects.select_related('opportunity', 'volunteer_profile').filter(id=application_id).first()
        if not app:
            logger.warning("send_application_status_email: VolunteerApplication not found for ID %s", application_id)
            return False

        site_name = getattr(settings, 'SITE_NAME', 'Responsible Individuals')
        context = {
            'full_name': app.volunteer_profile.full_name,
            'opportunity_title': app.opportunity.title,
            'location': app.opportunity.location,
            'commitment': app.opportunity.commitment,
            'review_notes': app.review_notes,
            'status': status,
        }

        if status == VolunteerApplication.Status.APPROVED:
            subject = f"Application Approved: {app.opportunity.title} – {site_name}"
            template_base = 'volunteers/emails/application_approved'
        elif status == VolunteerApplication.Status.REJECTED:
            subject = f"Update on Your Volunteer Application: {app.opportunity.title} – {site_name}"
            template_base = 'volunteers/emails/application_rejected'
        elif status == VolunteerApplication.Status.WAITLISTED:
            subject = f"Application Waitlisted: {app.opportunity.title} – {site_name}"
            template_base = 'volunteers/emails/application_waitlisted'
        else:
            logger.info("No status email template defined for status '%s' (Application %s)", status, application_id)
            return False

        _send_templated_email(
            subject=subject,
            template_base=template_base,
            context=context,
            recipient_list=[app.volunteer_profile.email],
        )
        logger.info("Application status (%s) email sent successfully for application %s to %s", status, application_id, app.volunteer_profile.email)
        return True

    except Retry:
        raise
    except Exception as exc:
        logger.error(
            "Failed sending application status (%s) email for application %s (Attempt %d/%d): %s",
            status,
            application_id,
            self.request.retries + 1,
            self.max_retries,
            str(exc)
        )
        try:
            raise self.retry(exc=exc, countdown=min(300, 30 * (2 ** self.request.retries)))
        except MaxRetriesExceededError:
            logger.error("Max retries exceeded sending status email for application %s", application_id)
            return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_onboarding_submitted_admin_email(self, onboarding_application_id):
    """
    Notifies volunteer administrators that a new volunteer onboarding application has been submitted.
    """
    try:
        app = VolunteerOnboardingApplication.objects.select_related('volunteer_profile').filter(id=onboarding_application_id).first()
        if not app:
            logger.warning("send_onboarding_submitted_admin_email: OnboardingApplication not found for ID %s", onboarding_application_id)
            return False

        site_name = getattr(settings, 'SITE_NAME', 'Responsible Individuals')
        subject = f"New Volunteer Onboarding Application: {app.volunteer_profile.full_name} – {site_name}"
        admin_email = _get_contact_email()

        context = {
            'full_name': app.volunteer_profile.full_name,
            'email': app.volunteer_profile.email,
            'city': app.volunteer_profile.city,
            'skills': app.skills_summary or app.volunteer_profile.skills,
            'statement_of_intent': app.statement_of_intent,
            'submitted_date': app.submitted_at.strftime('%B %d, %Y') if app.submitted_at else 'Recently',
        }

        try:
            _send_templated_email(
                subject=subject,
                template_base='volunteers/emails/admin_onboarding_received',
                context=context,
                recipient_list=[admin_email],
            )
        except Exception as t_err:
            logger.warning("Falling back to plaintext notification for onboarding submission %s: %s", onboarding_application_id, t_err)
            from django.core.mail import send_mail
            send_mail(
                subject=subject,
                message=f"New volunteer onboarding application received from {app.volunteer_profile.full_name} ({app.volunteer_profile.email}). Please review in Admin Portal.",
                from_email=_get_from_email(),
                recipient_list=[admin_email],
                fail_silently=True,
            )

        logger.info("Admin onboarding notification sent for application %s", onboarding_application_id)
        return True

    except Retry:
        raise
    except Exception as exc:
        logger.error("Failed sending admin onboarding notification for %s: %s", onboarding_application_id, exc)
        return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_onboarding_decision_email(self, onboarding_application_id, decision):
    """
    Sends decision notification (Approved / Rejected) to volunteer applicant.
    """
    try:
        app = VolunteerOnboardingApplication.objects.select_related('volunteer_profile').filter(id=onboarding_application_id).first()
        if not app:
            logger.warning("send_onboarding_decision_email: OnboardingApplication not found for ID %s", onboarding_application_id)
            return False

        site_name = getattr(settings, 'SITE_NAME', 'Responsible Individuals')
        context = {
            'full_name': app.volunteer_profile.full_name,
            'admin_notes': app.admin_review_notes,
            'decision': decision,
        }

        if decision == VolunteerOnboardingApplication.Status.APPROVED:
            subject = f"Welcome to Responsible Individuals! Your Volunteer Onboarding is Approved – {site_name}"
            template_base = 'volunteers/emails/onboarding_approved'
        else:
            subject = f"Update on Your Volunteer Application – {site_name}"
            template_base = 'volunteers/emails/onboarding_rejected'

        try:
            _send_templated_email(
                subject=subject,
                template_base=template_base,
                context=context,
                recipient_list=[app.volunteer_profile.email],
            )
        except Exception as t_err:
            logger.warning("Falling back to plaintext decision email for application %s: %s", onboarding_application_id, t_err)
            from django.core.mail import send_mail
            msg = (
                f"Hello {app.volunteer_profile.full_name},\n\nYour volunteer onboarding application has been {decision.lower()}.\n"
                f"Notes: {app.admin_review_notes or 'None'}\n\nThank you,\n{site_name}"
            )
            send_mail(
                subject=subject,
                message=msg,
                from_email=_get_from_email(),
                recipient_list=[app.volunteer_profile.email],
                fail_silently=True,
            )

        logger.info("Onboarding decision email sent for application %s", onboarding_application_id)
        return True

    except Retry:
        raise
    except Exception as exc:
        logger.error("Failed sending onboarding decision email for %s: %s", onboarding_application_id, exc)
        return False


