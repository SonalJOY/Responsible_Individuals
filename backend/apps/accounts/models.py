import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from apps.core.models import TimeStampedModel


class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier for auth."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.SUPER_ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        CONTENT_ADMIN = 'CONTENT_ADMIN', 'Content Admin'
        PROJECT_MANAGER = 'PROJECT_MANAGER', 'Project Manager'
        VOLUNTEER_MANAGER = 'VOLUNTEER_MANAGER', 'Volunteer Manager'
        DONATION_MANAGER = 'DONATION_MANAGER', 'Donation Manager'
        EVENT_MANAGER = 'EVENT_MANAGER', 'Event Manager'
        PARTNER = 'PARTNER', 'Corporate / CSR Partner'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'
        DONOR = 'DONOR', 'Donor'
        PUBLIC = 'PUBLIC', 'Public User'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.PUBLIC, db_index=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name() or self.email} ({self.get_role_display()})"

    @property
    def is_admin_or_staff(self):
        return self.is_staff or self.role in [
            self.Role.SUPER_ADMIN,
            self.Role.CONTENT_ADMIN,
            self.Role.PROJECT_MANAGER,
            self.Role.VOLUNTEER_MANAGER,
            self.Role.DONATION_MANAGER,
            self.Role.EVENT_MANAGER,
        ]


class UserProfile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    organization = models.CharField(max_length=255, blank=True, null=True)
    designation = models.CharField(max_length=150, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    preferences = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Profile of {self.user.email}"
