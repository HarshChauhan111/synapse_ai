import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1DA1F2] to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-neutral-900">Synapse AI</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-neutral-500 mt-2">
              {isLogin
                ? 'Sign in to continue your learning journey'
                : 'Start your AI-powered learning journey'}
            </p>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required={!isLogin}
                      className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] outline-none transition-all text-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] outline-none transition-all text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] outline-none transition-all text-neutral-900 placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 bg-gradient-to-r from-[#1DA1F2] to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <span className="text-neutral-500">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={toggleMode}
              className="text-[#1DA1F2] font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center mt-6 text-sm text-neutral-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

export default AuthPage;
