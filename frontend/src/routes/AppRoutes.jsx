
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalPreloader from '../components/common/GlobalPreloader';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages (Lazy Loaded for route chunk preloading)
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const AboutPage = lazy(() => import('../pages/About/AboutPage'));
const ProjectsPage = lazy(() => import('../pages/Projects/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('../pages/Projects/ProjectDetailPage'));
const ImpactPage = lazy(() => import('../pages/Impact/ImpactPage'));
const VolunteerPage = lazy(() => import('../pages/Volunteer/VolunteerPage'));
const DonatePage = lazy(() => import('../pages/Donate/DonatePage'));
const EventsPage = lazy(() => import('../pages/Events/EventsPage'));
const StoriesPage = lazy(() => import('../pages/Stories/StoriesPage'));
const StoryDetailPage = lazy(() => import('../pages/Stories/StoryDetailPage'));
const GalleryPage = lazy(() => import('../pages/Gallery/GalleryPage'));
const PartnersPage = lazy(() => import('../pages/Partners/PartnersPage'));
const CareersPage = lazy(() => import('../pages/Careers/CareersPage'));
const ContactPage = lazy(() => import('../pages/Contact/ContactPage'));

// Authentication Pages
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const VerifyOTPPage = lazy(() => import('../pages/Auth/VerifyOTPPage'));
const LoginOTPPage = lazy(() => import('../pages/Auth/LoginOTPPage'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const AdminVolunteers = lazy(() => import('../pages/Admin/AdminVolunteers'));
const AdminDonations = lazy(() => import('../pages/Admin/AdminDonations'));
const AdminEnquiries = lazy(() => import('../pages/Admin/AdminEnquiries'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<GlobalPreloader isLoading={true} isExiting={false} message="Loading page..." />}>
      <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}
      <Route path="/" element={<PublicLayout />}>

        <Route index element={<HomePage />} />

        <Route path="about" element={<AboutPage />} />

        <Route path="projects" element={<ProjectsPage />} />

        <Route
          path="projects/:slug"
          element={<ProjectDetailPage />}
        />

        <Route path="impact" element={<ImpactPage />} />

        <Route path="volunteer" element={<VolunteerPage />} />

        <Route path="donate" element={<DonatePage />} />

        <Route path="events" element={<EventsPage />} />

        <Route path="stories" element={<StoriesPage />} />

        <Route
          path="stories/:slug"
          element={<StoryDetailPage />}
        />

        <Route path="gallery" element={<GalleryPage />} />

        <Route path="partners" element={<PartnersPage />} />

        <Route path="careers" element={<CareersPage />} />

        <Route path="contact" element={<ContactPage />} />

        {/* =========================
            AUTHENTICATION
        ========================== */}

        <Route
          path="login"
          element={<LoginPage />}
        />

        <Route
          path="register"
          element={<RegisterPage />}
        />

        <Route
          path="verify-otp"
          element={<VerifyOTPPage />}
        />

        <Route
          path="login-otp"
          element={<LoginOTPPage />}
        />

        <Route
          path="forgot-password"
          element={<ForgotPasswordPage />}
        />

      </Route>

      {/* =========================
          ADMIN ROUTES
      ========================== */}

      <Route
        path="/admin-portal"
        element={<AdminLayout />}
      >

        <Route
          index
          element={<AdminDashboard />}
        />

        <Route
          path="volunteers"
          element={<AdminVolunteers />}
        />

        <Route
          path="donations"
          element={<AdminDonations />}
        />

        <Route
          path="enquiries"
          element={<AdminEnquiries />}
        />

      </Route>

      {/* =========================
          FALLBACK
      ========================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
    </Suspense>
  );
}