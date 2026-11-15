import os
import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape

logger = logging.getLogger(__name__)

DEFAULT_CONTACT_RECIPIENT = 'ri.responsibleindividuals@gmail.com'


def send_contact_enquiry_notification(enquiry):
    """
    Sends an immediate notification email to the contact coordinator (ri.responsibleindividuals@gmail.com)
    when a user submits the "Send a Direct Message" form on the Contact page.
    """
    admin_recipient = getattr(settings, 'CONTACT_ADMIN_EMAIL', DEFAULT_CONTACT_RECIPIENT)
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Responsible Individuals <noreply@responsibleindividuals.org>')

    department_display = (
        enquiry.get_department_display()
        if hasattr(enquiry, 'get_department_display') and callable(enquiry.get_department_display)
        else getattr(enquiry, 'department', 'General Inquiry')
    )
    subject = f"[Website Inquiry - {department_display}] {enquiry.subject}"

    # Plain text version
    text_content = (
        f"New Contact Inquiry Received via Responsible Individuals Website\n\n"
        f"Sender Details:\n"
        f"• Name: {enquiry.name}\n"
        f"• Email: {enquiry.email}\n"
        f"• Phone: {enquiry.phone or 'Not provided'}\n"
        f"• Department: {department_display}\n"
        f"• Submitted At: {enquiry.created_at.strftime('%d %b %Y, %I:%M %p') if getattr(enquiry, 'created_at', None) else 'Just now'}\n\n"
        f"Subject:\n"
        f"{enquiry.subject}\n\n"
        f"Message:\n"
        f"--------------------------------------------------\n"
        f"{enquiry.message}\n"
        f"--------------------------------------------------\n\n"
        f"You can reply directly to this email to respond to {enquiry.name} ({enquiry.email}).\n"
    )

    # HTML formatted version
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{escape(subject)}</title>
    </head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <tr>
          <td style="background-color: #065F46; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Responsible Individuals</h1>
            <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 13px;">New Contact & Department Inquiry</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px;">
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 4px 4px 0;">
              <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #047857; letter-spacing: 0.5px;">Routed Department</span>
              <div style="font-size: 16px; font-weight: 700; color: #065f46; margin-top: 2px;">{escape(str(department_display))}</div>
            </div>

            <table border="0" cellpadding="6" cellspacing="0" width="100%" style="font-size: 14px; margin-bottom: 20px; border-collapse: collapse;">
              <tr>
                <td width="120" style="color: #64748b; font-weight: 600; padding: 6px 0;">Sender Name:</td>
                <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">{escape(enquiry.name)}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: 600; padding: 6px 0;">Sender Email:</td>
                <td style="color: #0f172a; padding: 6px 0;"><a href="mailto:{escape(enquiry.email)}" style="color: #059669; text-decoration: none;">{escape(enquiry.email)}</a></td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: 600; padding: 6px 0;">Phone:</td>
                <td style="color: #0f172a; padding: 6px 0;">{escape(enquiry.phone) if enquiry.phone else '<span style="color: #94a3b8;">Not provided</span>'}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: 600; padding: 6px 0;">Subject:</td>
                <td style="color: #0f172a; font-weight: 600; padding: 6px 0;">{escape(enquiry.subject)}</td>
              </tr>
            </table>

            <div style="margin-top: 16px; padding: 16px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Message Content:</div>
              <div style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">{escape(enquiry.message)}</div>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:{escape(enquiry.email)}?subject=Re:%20{escape(enquiry.subject)}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 10px 20px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">Reply Directly to {escape(enquiry.name)}</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b;">
            This email was automatically dispatched by the Responsible Individuals Contact Form.
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    web3forms_key = getattr(settings, 'WEB3FORMS_ACCESS_KEY', os.environ.get('WEB3FORMS_ACCESS_KEY', ''))
    if web3forms_key:
        try:
            import json
            import urllib.request
            payload = json.dumps({
                "access_key": web3forms_key,
                "name": enquiry.name,
                "email": enquiry.email,
                "phone": enquiry.phone or 'Not provided',
                "department": str(department_display),
                "subject": subject,
                "message": enquiry.message,
                "from_name": "Responsible Individuals Website",
            }).encode('utf-8')
            req = urllib.request.Request(
                "https://api.web3forms.com/submit",
                data=payload,
                headers={"Content-Type": "application/json", "Accept": "application/json", "User-Agent": "ResponsibleIndividuals/1.0"}
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status in (200, 201):
                    logger.info("Successfully dispatched contact enquiry via Web3Forms for #%s", enquiry.id)
                    print(f"\n[WEB3FORMS DISPATCH] Dispatched to ri.responsibleindividuals@gmail.com for enquiry #{enquiry.id}\n")
                    return True
        except Exception as w_err:
            logger.warning("Web3Forms dispatch error, falling back to SMTP/console: %s", w_err)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=from_email,
        to=[admin_recipient],
        reply_to=[enquiry.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)
    logger.info("Dispatched contact enquiry email to %s for enquiry #%s from %s", admin_recipient, enquiry.id, enquiry.email)
    print(f"\n[CONTACT ENQUIRY EMAIL] Dispatched to {admin_recipient} from {enquiry.email} (Subject: {subject})\n")
    return True
