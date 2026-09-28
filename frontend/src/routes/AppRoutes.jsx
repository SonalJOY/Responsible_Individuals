import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import HomePage from '../pages/Home/HomePage';
import AboutPage from '../pages/About/AboutPage';
import ProjectsPage from '../pages/Projects/ProjectsPage';
import ProjectDetailPage from '../pages/Projects/ProjectDetailPage';
import ImpactPage from '../pages/Impact/ImpactPage';
import VolunteerPage from '../pages/Volunteer/VolunteerPage';
import DonatePage from '../pages/Donate/DonatePage';
import EventsPage from '../pages/Events/EventsPage';
import StoriesPage from '../pages/Stories/StoriesPage';
import StoryDetailPage from '../pages/Stories/StoryDetailPage';
import GalleryPage from '../pages/Gallery/GalleryPage';
import PartnersPage from '../pages/Partners/PartnersPage';
import CareersPage from '../pages/Careers/CareersPage';
import ContactPage from '../pages/Contact/ContactPage';
import LoginPage from '../pages/Auth/LoginPage';

// Admin Pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminVolunteers from '../pages/Admin/AdminVolunteers';
import AdminDonations from '../pages/Admin/AdminDonations';
import AdminEnquiries from '../pages/Admin/AdminEnquiries';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="volunteer" element={<VolunteerPage />} />
        <Route path="donate" element={<DonatePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="stories" element={<StoriesPage />} />
        <Route path="stories/:slug" element={<StoryDetailPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/admin-portal" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="volunteers" element={<AdminVolunteers />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
