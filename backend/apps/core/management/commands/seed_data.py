from decimal import Decimal
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts.models import UserProfile
from apps.cms.models import Page, PageSection, HeroBanner, SiteSetting
from apps.impact.models import ImpactArea, ImpactMetric, ImpactStatistic, ImpactReport
from apps.projects.models import (
    ProjectCategory, Project, ProjectObjective, ProjectActivity,
    ProjectKPI, ProjectPartner, ProjectMedia
)
from apps.events.models import Event, EventRegistration
from apps.stories.models import Story, StoryCategory
from apps.gallery.models import GalleryAlbum, GalleryItem
from apps.volunteers.models import (
    VolunteerInterest, VolunteerOpportunity, VolunteerProfile,
    VolunteerApplication, VolunteerParticipation
)
from apps.donations.models import Campaign, Donor, Donation
from apps.partners.models import Partner, PartnerEnquiry, SupportedProject
from apps.careers.models import JobPost
from apps.contact.models import ContactEnquiry, NewsletterSubscriber

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds realistic, high-fidelity sample data for Responsible Individuals platform'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting Responsible Individuals data seed...'))

        # 1. Admin Superuser
        admin_email = 'admin@responsibleindividuals.org'
        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'first_name': 'Abishek',
                'last_name': 'Admin',
                'role': User.Role.SUPER_ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        if created:
            admin_user.set_password('Admin@12345')
            admin_user.save()
            UserProfile.objects.create(
                user=admin_user,
                organization='Responsible Individuals Foundation',
                designation='Executive Director',
                city='Bengaluru',
                state='Karnataka',
                bio='Driving collective social and environmental responsibility through accountable action.'
            )
            self.stdout.write(self.style.SUCCESS(f'Created Super Admin: {admin_email} (Admin@12345)'))
        else:
            self.stdout.write(self.style.NOTICE(f'Admin user {admin_email} already exists.'))

        # 2. Site Settings & CMS
        SiteSetting.objects.get_or_create(key='site_name', defaults={'value': 'Responsible Individuals', 'description': 'Organization name'})
        SiteSetting.objects.get_or_create(key='tagline', defaults={'value': 'Building Responsible Communities. Creating Sustainable Impact.', 'description': 'Brand motto'})
        SiteSetting.objects.get_or_create(key='contact_email', defaults={'value': 'connect@responsibleindividuals.org', 'description': 'Public email'})
        SiteSetting.objects.get_or_create(key='contact_phone', defaults={'value': '+91 80 4123 4567', 'description': 'HQ phone'})
        SiteSetting.objects.get_or_create(key='address', defaults={'value': '#42, Social Innovation Corridor, Indiranagar, Bengaluru, KA 560038', 'description': 'HQ address'})
        SiteSetting.objects.get_or_create(key='donation_tax_exemption', defaults={'value': 'All donations eligible for 50% deduction under Section 80G of the Income Tax Act.', 'description': '80G notice'})

        # Hero Banner
        HeroBanner.objects.get_or_create(
            title='Building Responsible Communities. Creating Sustainable Impact.',
            defaults={
                'subtitle': 'A data-driven platform empowering citizens, volunteers, and CSR leaders to solve pressing environmental and social challenges through measurable collective action.',
                'badge_text': 'Social Impact Baseline • 2026',
                'primary_btn_text': 'Explore Our Work',
                'primary_btn_url': '/projects',
                'secondary_btn_text': 'Become a Volunteer',
                'secondary_btn_url': '/volunteer',
                'order': 1,
            }
        )

        # 3. Impact Statistics (Homepage Counters)
        stats_data = [
            ('projects_completed', 'Projects Completed', '50+', 50, '+', 'Award', 1),
            ('communities_reached', 'Communities Reached', '120+', 120, '+', 'Home', 2),
            ('lives_impacted', 'Lives Transformed', '50,000+', 50000, '+', 'Users', 3),
            ('active_volunteers', 'Active Volunteers', '2,500+', 2500, '+', 'HeartHandshake', 4),
            ('water_saved', 'Water Saved', '4.2M L', 4200000, ' L', 'Droplet', 5),
            ('corporate_partners', 'CSR & Partners', '18+', 18, '+', 'Building2', 6),
        ]
        for key, title, counter_value, raw, suffix, icon, order in stats_data:
            ImpactStatistic.objects.get_or_create(
                key=key,
                defaults={
                    'title': title,
                    'counter_value': counter_value,
                    'raw_number': raw,
                    'suffix': suffix,
                    'icon_name': icon,
                    'order': order,
                }
            )

        # 4. Impact Areas
        areas_data = [
            (
                'environment', 'Environment & Water Restoration',
                'Protecting lakes, restoring urban watersheds, and driving afforestation for resilient cities.',
                'TreePine', '#10B981', 'SDG 6: Clean Water, SDG 13: Climate Action, SDG 15: Life on Land', 1
            ),
            (
                'education', 'Education & Digital Literacy',
                'Equipping underserved government schools with modern digital STEM labs and teacher mentorship.',
                'GraduationCap', '#3B82F6', 'SDG 4: Quality Education, SDG 10: Reduced Inequalities', 2
            ),
            (
                'community', 'Community Development & Waste',
                'Fostering decentralized waste segregation, clean neighborhood stewardship, and civic safety.',
                'Users', '#F59E0B', 'SDG 11: Sustainable Cities, SDG 12: Responsible Consumption', 3
            ),
            (
                'health', 'Healthcare & Preventive Wellness',
                'Providing mobile diagnostics, maternal wellness checkups, and clean drinking water filtration.',
                'HeartPulse', '#EC4899', 'SDG 3: Good Health and Well-being', 4
            ),
            (
                'livelihood', 'Sustainable Livelihoods & Skills',
                'Empowering women micro-entrepreneurs and youth through vocational training and market linkages.',
                'Briefcase', '#8B5CF6', 'SDG 8: Decent Work and Economic Growth', 5
            ),
            (
                'civic', 'Civic Responsibility & Youth Leadership',
                'Engaging youth and citizen collectives to bridge the gap between citizens and local governance.',
                'ShieldCheck', '#0D9488', 'SDG 16: Peace, Justice and Strong Institutions, SDG 17: Partnerships', 6
            ),
        ]
        created_areas = {}
        for slug, name, desc, icon, color, sdg, order in areas_data:
            area, _ = ImpactArea.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': desc,
                    'icon_name': icon,
                    'color_accent': color,
                    'sdg_alignment': sdg,
                    'order': order,
                }
            )
            created_areas[slug] = area

        # Area Metrics
        ImpactMetric.objects.get_or_create(
            impact_area=created_areas['environment'],
            name='Water Bodies Rejuvenated',
            defaults={'metric_type': 'OUTPUT', 'unit': 'Lakes', 'baseline_value': 0, 'target_value': 8, 'achieved_value': 6, 'order': 1}
        )
        ImpactMetric.objects.get_or_create(
            impact_area=created_areas['environment'],
            name='Native Trees Planted',
            defaults={'metric_type': 'OUTPUT', 'unit': 'Saplings', 'baseline_value': 0, 'target_value': 25000, 'achieved_value': 18400, 'order': 2}
        )
        ImpactMetric.objects.get_or_create(
            impact_area=created_areas['education'],
            name='Rural Schools Upgraded',
            defaults={'metric_type': 'OUTPUT', 'unit': 'Schools', 'baseline_value': 0, 'target_value': 50, 'achieved_value': 42, 'order': 1}
        )
        ImpactMetric.objects.get_or_create(
            impact_area=created_areas['education'],
            name='Students with Digital Access',
            defaults={'metric_type': 'REACH', 'unit': 'Students', 'baseline_value': 500, 'target_value': 15000, 'achieved_value': 12800, 'order': 2}
        )

        # 5. Project Categories
        cat_env, _ = ProjectCategory.objects.get_or_create(slug='eco-restoration', defaults={'name': 'Eco Restoration & Climate'})
        cat_edu, _ = ProjectCategory.objects.get_or_create(slug='education-empowerment', defaults={'name': 'Education & Digital Access'})
        cat_comm, _ = ProjectCategory.objects.get_or_create(slug='civic-action', defaults={'name': 'Community & Civic Action'})

        # 6. Projects with Lifecycle & KPIs
        p1, _ = Project.objects.get_or_create(
            slug='lake-rejuvenation-bengaluru-east',
            defaults={
                'title': 'Kaikondrahalli-Varthur Feeder Lake Rejuvenation',
                'category': cat_env,
                'focus_area': created_areas['environment'],
                'status': Project.Status.IN_PROGRESS,
                'location': 'Bengaluru East, Karnataka',
                'summary': 'Transforming a silted 14-acre feeder wetland into a thriving biodiversity sanctuary and rainwater harvesting reserve.',
                'description': 'This project addresses urban runoff pollution and water depletion by desilting stormwater inflow channels, constructing constructed wetland bio-filtration beds, creating nesting islands, and planting 3,500 native shoreline plants with local resident volunteers.',
                'problem_statement': 'Untreated sewage inflow and heavy siltation reduced the wetland water retention capacity by 78%, causing severe localized flooding and groundwater contamination.',
                'solution_approach': 'A 4-stage community-led ecological restoration: desilting, bioswale filtration, volunteer tree planting, and establishing a Citizen Wetland Watch committee.',
                'start_date': date(2025, 4, 1),
                'end_date': date(2026, 12, 31),
                'budget': Decimal('4500000.00'),
                'raised_amount': Decimal('3850000.00'),
                'beneficiaries_count': 18500,
                'featured': True,
            }
        )
        ProjectKPI.objects.get_or_create(project=p1, metric_name='Water Storage Capacity', defaults={'baseline': Decimal('12.0'), 'target': Decimal('60.0'), 'achieved': Decimal('48.5'), 'unit': 'Million Litres'})
        ProjectKPI.objects.get_or_create(project=p1, metric_name='Dissolved Oxygen (DO)', defaults={'baseline': Decimal('1.8'), 'target': Decimal('6.5'), 'achieved': Decimal('5.6'), 'unit': 'mg/L'})
        ProjectKPI.objects.get_or_create(project=p1, metric_name='Volunteer Hours Invested', defaults={'baseline': Decimal('0'), 'target': Decimal('2000'), 'achieved': Decimal('1650'), 'unit': 'Hours'})
        ProjectObjective.objects.get_or_create(project=p1, title='Bio-remediate water inlet channels', defaults={'target': '100% channel clearance', 'order': 1})
        ProjectObjective.objects.get_or_create(project=p1, title='Establish 2-km walking bund and bird observatory', defaults={'target': 'Complete by Q3 2026', 'order': 2})
        ProjectActivity.objects.get_or_create(project=p1, title='Community Desilting Drive with 200 Volunteers', defaults={'status': 'COMPLETED', 'date': date(2025, 10, 15), 'outcome': 'Removed 18 tons of solid waste and plastic debris'})
        ProjectActivity.objects.get_or_create(project=p1, title='Native Flora Planting Day', defaults={'status': 'IN_PROGRESS', 'date': date(2026, 8, 20), 'outcome': '1,200 vetiver grass clusters established'})

        p2, _ = Project.objects.get_or_create(
            slug='rural-digital-classrooms-stem-hub',
            defaults={
                'title': 'Digital Classrooms & STEM Labs for Rural Government Schools',
                'category': cat_edu,
                'focus_area': created_areas['education'],
                'status': Project.Status.IN_PROGRESS,
                'location': 'Kolar & Tumakuru Districts, Karnataka',
                'summary': 'Bridging the rural-urban digital divide by establishing interactive smart classrooms, robotics labs, and teacher training programs in 30 rural high schools.',
                'description': 'Providing solar-powered digital display systems, curated regional language STEM learning software, tablet libraries, and weekly volunteer tutoring sessions to boost foundational mathematics and science engagement.',
                'problem_statement': 'Rural students faced up to a 4-year learning gap in science concepts and lack access to basic computer hardware or internet.',
                'solution_approach': 'Hybrid model pairing durable solar-powered smart classroom equipment with trained university volunteer fellows visiting bi-weekly.',
                'start_date': date(2025, 6, 1),
                'end_date': date(2027, 3, 31),
                'budget': Decimal('3200000.00'),
                'raised_amount': Decimal('2750000.00'),
                'beneficiaries_count': 7400,
                'featured': True,
            }
        )
        ProjectKPI.objects.get_or_create(project=p2, metric_name='Smart STEM Labs Commissioned', defaults={'baseline': Decimal('0'), 'target': Decimal('30'), 'achieved': Decimal('24'), 'unit': 'Schools'})
        ProjectKPI.objects.get_or_create(project=p2, metric_name='Math Concept Pass Rate', defaults={'baseline': Decimal('42.0'), 'target': Decimal('85.0'), 'achieved': Decimal('78.4'), 'unit': '%'})

        p3, _ = Project.objects.get_or_create(
            slug='urban-miyawaki-micro-forests',
            defaults={
                'title': 'Urban Micro-Forests: Miyawaki Green Lung Initiative',
                'category': cat_env,
                'focus_area': created_areas['environment'],
                'status': Project.Status.IN_PROGRESS,
                'location': 'Bengaluru Metro Area, Karnataka',
                'summary': 'Creating 10 dense native micro-forests on degraded institutional lands to curb urban heat islands and support local pollinator biodiversity.',
                'description': 'Utilizing the Japanese Miyawaki high-density planting technique with 42 native species of trees, shrubs, and canopy layers that grow 10x faster and absorb 30x more carbon.',
                'problem_statement': 'Rapid urban sprawl caused concrete surface temperatures to spike by 3.5°C with severe loss of native avian fauna.',
                'solution_approach': 'Site soil enrichment using organic compost, high-density native sapling installation, and 2-year citizen stewardship.',
                'start_date': date(2025, 8, 1),
                'end_date': date(2026, 11, 30),
                'budget': Decimal('1800000.00'),
                'raised_amount': Decimal('1800000.00'),
                'beneficiaries_count': 12000,
                'featured': True,
            }
        )

        p4, _ = Project.objects.get_or_create(
            slug='community-waste-circular-hub',
            defaults={
                'title': 'Zero-Waste Neighborhoods & Decentralized Composting Hubs',
                'category': cat_comm,
                'focus_area': created_areas['community'],
                'status': Project.Status.IN_PROGRESS,
                'location': 'Jayanagar & Malleshwaram, Bengaluru',
                'summary': 'Empowering 5,000 households to achieve 90% source segregation of organic wet waste, turning community organic waste into urban garden compost.',
                'description': 'Establishing aerobic composting units in ward parks, conducting door-to-door waste literacy drives, and partnering with local sanitation workers (Pourakarmikas) for fair dignity and safe gear.',
                'problem_statement': 'Mixed waste dumping in landfills causes methane emissions, ground fires, and hazardous working conditions.',
                'solution_approach': 'Equipping apartment clusters and residential streets with community composting bins and training youth volunteers as Green Ambassadors.',
                'start_date': date(2025, 9, 1),
                'end_date': date(2026, 10, 31),
                'budget': Decimal('1200000.00'),
                'raised_amount': Decimal('980000.00'),
                'beneficiaries_count': 15000,
                'featured': False,
            }
        )

        # 7. Stories of Change (Before & After)
        StoryCategory.objects.get_or_create(slug='water-environment', defaults={'name': 'Water & Environment'})
        cat_edu_story, _ = StoryCategory.objects.get_or_create(slug='education-youth', defaults={'name': 'Education & Youth'})

        Story.objects.get_or_create(
            slug='from-barren-silt-to-blooming-lake',
            defaults={
                'title': 'From Foul Silt to Blooming Wetland: How 300 Citizens Revived Varthur Inflow',
                'category': cat_edu_story,
                'focus_area': created_areas['environment'],
                'project': p1,
                'beneficiary_name': 'Kaikondrahalli Neighborhood Welfare Association',
                'location': 'Bengaluru East',
                'challenge': 'For over eight years, the stormwater drain had become a stagnant blackwater channel choked with construction debris and weeds. Groundwater borewells had run dry down to 900 feet.',
                'intervention': 'Responsible Individuals coordinated with municipal engineers, secured corporate CSR funding for mechanical desilting, and mobilized weekend community cleanups where residents cleared debris and planted water-purifying reeds.',
                'outcome': 'Today, open water has returned, 42 bird species have been recorded nesting on the newly created island, and neighboring borewells recharged by an average of 45 feet.',
                'quote': 'We proved that when individuals take ownership of their immediate environment with structured scientific backing, government authorities readily step up to partner.',
                'quote_author': 'Meera Sundararajan, Resident Coordinator',
                'featured': True,
            }
        )

        Story.objects.get_or_create(
            slug='first-generation-coder-from-kolar',
            defaults={
                'title': 'Cracking the Code: How 15-Year-Old Anitha Built an IoT Soil Sensor for Her Village',
                'category': cat_edu_story,
                'focus_area': created_areas['education'],
                'project': p2,
                'beneficiary_name': 'Anitha M. & Government High School Batch',
                'location': 'Kolar District, Karnataka',
                'challenge': 'Anitha had never touched a computer until 9th grade. Her father, a dryland farmer, suffered repeated crop losses from irregular soil moisture cycles.',
                'intervention': 'Through Responsible Individuals STEM Lab program, Anitha received hands-on robotics training, micro-controller programming, and mentorship from volunteer software engineers.',
                'outcome': 'Anitha won the State Science Exhibition with her solar-powered automated soil moisture alarm, and has received a full engineering fellowship scholarship.',
                'quote': 'The STEM lab showed me that science is not just exam textbooks — it is a tool to solve my father’s struggles in the field.',
                'quote_author': 'Anitha M., Student Fellow',
                'featured': True,
            }
        )

        # 8. Events
        ev1, _ = Event.objects.get_or_create(
            slug='lake-cleanup-and-tree-plantation-drive',
            defaults={
                'title': 'Monsoon Lake Restoration & Miyawaki Sapling Planting',
                'focus_area': created_areas['environment'],
                'description': 'Join 250 volunteers for our flagship monsoon plantation drive. We will be installing 800 native tree saplings, bio-mulching root beds, and clearing plastic trash along the shoreline.',
                'date': date(2026, 9, 26),
                'start_time': time(7, 30),
                'end_time': time(11, 30),
                'venue': 'Kaikondrahalli Lake Main Gate',
                'city': 'Bengaluru',
                'address': 'Sarjapur Main Road, Bengaluru, KA 560035',
                'capacity': 250,
                'registered_count': 142,
                'status': Event.Status.UPCOMING,
            }
        )
        ev2, _ = Event.objects.get_or_create(
            slug='stem-tutor-workshop-and-volunteer-orientation',
            defaults={
                'title': 'Rural School STEM Mentorship: Volunteer Orientation',
                'focus_area': created_areas['education'],
                'description': 'Orientation session for engineers, university students, and educators interested in teaching weekend science and coding sessions to rural government school students.',
                'date': date(2026, 10, 10),
                'start_time': time(10, 0),
                'end_time': time(13, 0),
                'venue': 'Social Impact Hub, Indiranagar',
                'city': 'Bengaluru',
                'address': '#42, 100ft Road, Indiranagar, Bengaluru',
                'capacity': 80,
                'registered_count': 56,
                'status': Event.Status.UPCOMING,
            }
        )

        # 9. Volunteer Opportunities & Interests
        int_lake, _ = VolunteerInterest.objects.get_or_create(slug='lake-revival', defaults={'name': 'Water & Lake Conservation'})
        int_stem, _ = VolunteerInterest.objects.get_or_create(slug='stem-mentorship', defaults={'name': 'STEM & Youth Mentorship'})
        int_waste, _ = VolunteerInterest.objects.get_or_create(slug='zero-waste', defaults={'name': 'Decentralized Waste & Ecology'})
        int_media, _ = VolunteerInterest.objects.get_or_create(slug='impact-storytelling', defaults={'name': 'Photography & Impact Storytelling'})

        opp1, _ = VolunteerOpportunity.objects.get_or_create(
            slug='weekend-wetland-steward-bengaluru',
            defaults={
                'title': 'Weekend Wetland Steward & Water Quality Monitor',
                'focus_area': created_areas['environment'],
                'project': p1,
                'location': 'Bengaluru East',
                'commitment': '4 hours on alternate Saturdays',
                'spots_available': 30,
                'spots_filled': 18,
                'description': 'Perform weekly water testing for dissolved oxygen and pH, assist in community bird census walks, and oversee desilting barrier maintenance.',
                'responsibilities': 'Conduct water sampling tests, log findings into mobile app, guide student tour batches.',
                'requirements': 'Enthusiasm for environmental science, punctual, willingness to engage in outdoors activities.',
                'status': VolunteerOpportunity.Status.OPEN,
            }
        )
        opp2, _ = VolunteerOpportunity.objects.get_or_create(
            slug='rural-stem-and-coding-mentor',
            defaults={
                'title': 'Rural High School STEM & Robotics Mentor',
                'focus_area': created_areas['education'],
                'project': p2,
                'location': 'Kolar District (Travel organized by RI)',
                'commitment': 'One full Saturday per month',
                'spots_available': 20,
                'spots_filled': 12,
                'description': 'Deliver interactive experiments in physics, robotics, and basic computer science using smart lab toolkits to grades 8-10.',
                'responsibilities': 'Teach small batches of 6-8 students, conduct problem-solving games, inspire students toward higher education.',
                'requirements': 'Basic background in engineering, science, or education; patience and passion for teaching.',
                'status': VolunteerOpportunity.Status.OPEN,
            }
        )

        # Sample Volunteer Profile & Application
        v_profile, _ = VolunteerProfile.objects.get_or_create(
            email='priya.sharma@example.com',
            defaults={
                'full_name': 'Priya Sharma',
                'phone': '+91 98765 43210',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'occupation': 'Software Engineer',
                'skills': 'Python, Teaching, Water Testing, Event Coordination',
                'availability': 'Weekends',
                'bio': 'Passionate about environmental conservation and teaching science to kids.',
                'approval_status': VolunteerProfile.ApprovalStatus.APPROVED,
                'total_hours_contributed': Decimal('48.5'),
            }
        )
        v_profile.interests.add(int_lake, int_stem)
        VolunteerApplication.objects.get_or_create(
            opportunity=opp1,
            volunteer_profile=v_profile,
            defaults={
                'statement_of_purpose': 'I live near the lake and want to actively participate in revitalizing the local wetland ecosystem.',
                'experience': 'Participated in two river cleanup drives and conducted science experiments for neighborhood children.',
                'status': VolunteerApplication.Status.APPROVED,
                'review_notes': 'Strong technical and community background. Approved for Saturday batch.',
            }
        )

        # 10. Donation Campaigns & Sample Donations
        c1, _ = Campaign.objects.get_or_create(
            slug='monsoon-wetland-revival-fund',
            defaults={
                'title': 'Monsoon Lake Revival & Silt Clearance Fund',
                'focus_area': created_areas['environment'],
                'project': p1,
                'description': 'Help fund heavy earthmoving equipment, bio-enzymes for wastewater bio-remediation, and 3,000 native shoreline saplings before the heavy monsoon arrives.',
                'goal_amount': Decimal('1500000.00'),
                'raised_amount': Decimal('1185000.00'),
                'donors_count': 142,
                'start_date': date(2026, 1, 1),
                'end_date': date(2026, 10, 31),
                'featured': True,
            }
        )

        d1_donor, _ = Donor.objects.get_or_create(
            email='rajesh.k@example.com',
            defaults={
                'full_name': 'Rajesh Krishnan',
                'phone': '+91 98450 12345',
                'pan_number': 'ABCDE1234F',
                'city': 'Bengaluru',
                'is_anonymous': False,
            }
        )
        Donation.objects.get_or_create(
            transaction_id='PAY-TX89201948',
            defaults={
                'donor': d1_donor,
                'campaign': c1,
                'project': p1,
                'amount': Decimal('15000.00'),
                'currency': 'INR',
                'frequency': Donation.Frequency.ONETIME,
                'payment_method': 'UPI / NetBanking',
                'status': Donation.Status.SUCCESS,
                'receipt_number': 'RI-2026-10492',
                'tax_exempt_80g': True,
            }
        )

        # 11. Corporate & CSR Partners
        p_corp1, _ = Partner.objects.get_or_create(
            slug='infosys-foundation-csr',
            defaults={
                'name': 'Infosys Foundation',
                'partner_type': Partner.PartnerType.CSR,
                'website': 'https://www.infosys.com/infosys-foundation.html',
                'description': 'Supporting rural school infrastructure, digital labs, and teacher capability building across Karnataka.',
                'since_year': 2024,
                'featured': True,
            }
        )
        p_corp2, _ = Partner.objects.get_or_create(
            slug='wipro-earthian-foundation',
            defaults={
                'name': 'Wipro Earthian',
                'partner_type': Partner.PartnerType.CSR,
                'website': 'https://www.wipro.com',
                'description': 'Collaborating on urban water sustainability, ecological literacy, and campus wetland rejuvenation.',
                'since_year': 2024,
                'featured': True,
            }
        )
        SupportedProject.objects.get_or_create(
            partner=p_corp1,
            project=p2,
            defaults={'contribution_amount': Decimal('2000000.00'), 'contribution_type': 'CSR STEM Grant', 'year': 2025}
        )

        # 12. Careers
        JobPost.objects.get_or_create(
            slug='senior-program-manager-environment',
            defaults={
                'title': 'Senior Program Manager - Ecological Restoration',
                'department': 'Programs & Impact',
                'job_type': JobPost.JobType.FULL_TIME,
                'location': 'Bengaluru (On-site / Field)',
                'experience_required': '4-7 years',
                'description': 'Lead end-to-end implementation of wetland restoration, tree plantations, and community stewardship projects across urban Karnataka.',
                'responsibilities': 'Supervise field project officers, coordinate with municipal government agencies, track KPI metrics, ensure safety compliance.',
                'requirements': 'Degree in Environmental Engineering/Science or related field, demonstrated track record in project management, fluency in Kannada and English.',
                'deadline': date(2026, 11, 30),
            }
        )
        JobPost.objects.get_or_create(
            slug='volunteer-community-coordinator',
            defaults={
                'title': 'Volunteer Engagement & Community Coordinator',
                'department': 'Operations',
                'job_type': JobPost.JobType.FULL_TIME,
                'location': 'Bengaluru (Hybrid)',
                'experience_required': '2-4 years',
                'description': 'Drive volunteer mobilization, design impactful weekend engagement experiences, manage partner CSR corporate volunteering drives.',
                'responsibilities': 'Onboard volunteers, organize orientations, coordinate certificates and hours auditing, curate volunteer storytelling.',
                'requirements': 'Superb communication, empathy, event management experience, digital savvy.',
                'deadline': date(2026, 10, 15),
            }
        )

        # 13. Contact Enquiries
        ContactEnquiry.objects.get_or_create(
            email='arun.nair@techfirm.com',
            subject='Corporate Volunteering Day for 150 Engineers',
            defaults={
                'name': 'Arun Nair',
                'phone': '+91 99887 76655',
                'department': ContactEnquiry.Department.CSR,
                'message': 'We would like to organize a team volunteering day around lake restoration or tree planting in October for our engineering staff.',
                'status': ContactEnquiry.Status.NEW,
            }
        )
        NewsletterSubscriber.objects.get_or_create(email='community.supporter@gmail.com')

        self.stdout.write(self.style.SUCCESS('Successfully seeded high-fidelity sample data across all modules!'))
