import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Home, User, LogOut, FolderOpen, ChevronDown, Store } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseTitle, courseSetupComplete, progressPercentage } = useCourse();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const isCoursePage = location.pathname.startsWith('/course');
  const isHomePage = location.pathname === '/';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use dark navbar on home page (dark background), light navbar on course page (white background)
  const navbarStyle = isHomePage
    ? 'bg-black/20 backdrop-blur-xl border-white/10'
    : 'bg-white/90 backdrop-blur-xl border-neutral-200 shadow-sm';

  const textStyle = isHomePage ? 'text-white' : 'text-neutral-800';
  const textMutedStyle = isHomePage ? 'text-white/80' : 'text-neutral-600';
  const textSubtleStyle = isHomePage ? 'text-white/60' : 'text-neutral-500';
  const buttonStyle = isHomePage
    ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900';
  const progressBgStyle = isHomePage ? 'bg-white/10' : 'bg-neutral-200';

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b ${navbarStyle}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className={`font-heading font-bold text-xl ${textStyle}`}>
              Synapse AI
            </span>
          </Link>

          {/* Center - Course Title (if on course page) */}
          {isCoursePage && courseTitle && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className={`text-sm max-w-md truncate ${textMutedStyle}`}>
                {courseTitle}
              </span>
            </motion.div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Progress indicator on course page */}
            {isCoursePage && courseSetupComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2"
              >
                <div className={`w-24 h-2 rounded-full overflow-hidden ${progressBgStyle}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
                <span className={`text-xs ${textSubtleStyle}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </motion.div>
            )}

            {/* Navigation links */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${buttonStyle}`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            )}

            {/* Marketplace link */}
            <Link
              to="/marketplace"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                location.pathname === '/marketplace' 
                  ? (isHomePage ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600')
                  : buttonStyle
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </Link>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${buttonStyle}`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1DA1F2] to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className={`hidden sm:inline text-sm ${textMutedStyle}`}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 ${textSubtleStyle} transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="font-medium text-neutral-900">{user?.name}</p>
                        <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
                      </div>

                      {/* Menu items */}
                      <Link
                        to="/my-courses"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <FolderOpen className="w-4 h-4" />
                        My Courses
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white font-medium rounded-lg hover:bg-[#1a8cd8] transition-colors text-sm"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar at very top */}
      {isCoursePage && courseSetupComplete && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${progressBgStyle}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          />
        </div>
      )}
    </motion.nav>
  );
}

export default Navbar;
