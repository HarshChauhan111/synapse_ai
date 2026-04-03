import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Brain, Zap, ArrowRight, ChevronDown } from 'lucide-react';
import Button from '../components/common/Button';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Curriculum',
    description: 'Our AI analyzes your topic and designs the perfect learning path tailored to your goals.',
    color: '#6366f1',
  },
  {
    icon: BookOpen,
    title: 'Interactive Chapters',
    description: 'Each chapter features unique hero visuals, charts, and rich content to keep you engaged.',
    color: '#8b5cf6',
  },
  {
    icon: Zap,
    title: 'Smart Quizzes',
    description: 'Test your knowledge with adaptive quizzes that adjust based on your progress.',
    color: '#f59e0b',
  },
];

function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/20 border border-accent-primary/30 text-accent-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight"
          >
            Learn Anything with{' '}
            <span className="text-gradient">AI-Generated</span> Courses
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Transform any topic into a structured, interactive learning experience.
            Just enter what you want to learn, and our AI creates a complete course for you.
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Link to="/setup">
              <Button size="xl" glow icon={ArrowRight} iconPosition="right">
                Create Your Course
              </Button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={itemVariants}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-8 h-12 mx-auto rounded-full border-2 border-white/20 flex items-start justify-center p-2"
            >
              <ChevronDown className="w-4 h-4 text-white/40" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Three simple steps to your personalized learning journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -8 }}
                className="glass-card p-8 rounded-2xl text-center group"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon
                    className="w-8 h-8"
                    style={{ color: feature.color }}
                  />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-heading font-bold text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {[
              { step: 1, title: 'Enter Your Topic', desc: 'Tell us what you want to learn - any subject, any skill.' },
              { step: 2, title: 'Choose Your Pace', desc: 'Select chapter duration and let AI suggest the perfect structure.' },
              { step: 3, title: 'Start Learning', desc: 'Dive into rich, interactive content with AI tutor support.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-heading font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-heading font-bold text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-12 rounded-3xl"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-white/60 mb-8">
            Create your first AI-powered course in under a minute.
          </p>
          <Link to="/setup">
            <Button size="xl" glow icon={Sparkles}>
              Get Started Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            CourseForge AI • Built with React, Gemini AI & ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
