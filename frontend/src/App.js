import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.scss';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import AboutPage from './pages/info/AboutPage';
import ClientsPage from './pages/info/ClientsPage';
import PerformersPage from './pages/info/PerformersPage';

import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import ConsentPage from './pages/legal/ConsentPage';

import HomePage from './pages/main/HomePage';
import ServiceDetailPage from './pages/main/ServiceDetailPage';
import CreateServicePage from './pages/main/CreateServicePage';
import Profile from './pages/main/Profile';
import Calendar from './pages/main/Calendar';
import ModerationPage from './pages/main/ModerationPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/service/:slug" element={<ServiceDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/performers" element={<PerformersPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/consent" element={<ConsentPage />} />



            <Route element={<ProtectedRoute />}>
              <Route path="/create-service" element={<CreateServicePage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/moderation" element={<ModerationPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;