import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { ChatbotProvider } from './context/ChatbotContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import CourseSetupPage from './pages/CourseSetupPage';
import CoursePage from './pages/CoursePage';
import AuthPage from './pages/AuthPage';
import MyCoursesPage from './pages/MyCoursesPage';
import './index.css';

// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-[#1DA1F2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/my-courses" 
          element={
            <ProtectedRoute>
              <MyCoursesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/setup" 
          element={
            <ProtectedRoute>
              <CourseSetupPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/course" 
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/course/:courseId" 
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/auth'].includes(location.pathname);

  return (
    <CourseProvider>
      <ChatbotProvider>
        <div className="min-h-screen bg-dark">
          {!hideNavbar && <Navbar />}
          <AnimatedRoutes />
        </div>
      </ChatbotProvider>
    </CourseProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
