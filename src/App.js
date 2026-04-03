import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CourseProvider } from './context/CourseContext';
import { ChatbotProvider } from './context/ChatbotContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import CourseSetupPage from './pages/CourseSetupPage';
import CoursePage from './pages/CoursePage';
import './index.css';

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<CourseSetupPage />} />
        <Route path="/course" element={<CoursePage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <CourseProvider>
        <ChatbotProvider>
          <div className="min-h-screen bg-dark">
            <Navbar />
            <AnimatedRoutes />
          </div>
        </ChatbotProvider>
      </CourseProvider>
    </Router>
  );
}

export default App;
