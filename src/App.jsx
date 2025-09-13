import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import HomePage from '@/pages/HomePage';
import JobAdvicePage from '@/pages/JobAdvicePage';
import TestimonialsPage from '@/pages/TestimonialsPage';
import AboutUsPage from '@/pages/AboutUsPage';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import ResumeServicesPage from '@/pages/ResumeServicesPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import SuccessPage from '@/pages/SuccessPage';
import QuestionnairePage from '@/pages/QuestionnairePage';
import ProtectedRoute from '@/components/ProtectedRoute';
import ContactPage from '@/pages/ContactPage';
import StripeCheckoutPage from '@/pages/StripeCheckoutPage';
import UserDashboardPage from '@/pages/UserDashboardPage';
import UserProtectedRoute from '@/components/UserProtectedRoute';
import EnhancedAdminDashboardPage from '@/pages/EnhancedAdminDashboardPage';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import DisclaimerPage from '@/pages/DisclaimerPage';
import PasswordSetupPage from '@/pages/PasswordSetupPage';
import { usePurchaseIntent } from '@/hooks/usePurchaseIntent';

// Component that handles purchase intent inside Router context
function AppContent() {
  // Handle purchase intent after login
  usePurchaseIntent();
  
  return (
    <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="resume-services" element={<ResumeServicesPage />} />
            <Route path="job-advice" element={<JobAdvicePage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="about" element={<AboutUsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route 
              path="stripe-checkout"
              element={
                <ProtectedRoute>
                  <StripeCheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route path="terms-of-service" element={<TermsOfServicePage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="disclaimer" element={<DisclaimerPage />} />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="dashboard"
              element={
                <UserProtectedRoute>
                  <UserDashboardPage />
                </UserProtectedRoute>
              }
            />
            <Route 
              path="admin"
              element={
                <AdminProtectedRoute>
                  <EnhancedAdminDashboardPage />
                </AdminProtectedRoute>
              }
            />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="questionnaire" element={<QuestionnairePage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="setup-password" element={<PasswordSetupPage />} />
          </Route>
        </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;