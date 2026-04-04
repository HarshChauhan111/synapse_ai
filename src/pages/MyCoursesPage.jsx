import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Clock, ChevronRight, Plus, Trash2, 
  GraduationCap, Trophy, TrendingUp, Loader2, Globe, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courseAPI, quizAPI } from '../api/backend';
import Navbar from '../components/common/Navbar';
import PublishModal from '../components/marketplace/PublishModal';

function MyCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [publishModalCourse, setPublishModalCourse] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, statsRes] = await Promise.all([
        courseAPI.getAll(),
        quizAPI.getStats(),
      ]);
      setCourses(coursesRes.courses || []);
      setStats(statsRes.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(courseId);
      await courseAPI.delete(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      alert('Failed to delete course: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleContinueCourse = (course) => {
    // Navigate to course page with course data
    navigate(`/course/${course.id}`);
  };

  const handlePublishClick = (course, e) => {
    e.preventDefault();
    e.stopPropagation();
    setPublishModalCourse(course);
  };

  const handlePublished = () => {
    // Reload courses to get updated publish status
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DA1F2]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
            </h1>
            <p className="text-neutral-500 mt-1">
              Continue your learning journey
            </p>
          </div>
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DA1F2] text-white font-semibold rounded-xl hover:bg-[#1a8cd8] transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            New Course
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={BookOpen}
              label="Courses"
              value={courses.length}
              color="blue"
            />
            <StatsCard
              icon={GraduationCap}
              label="Completed"
              value={courses.filter(c => c.completed).length}
              color="green"
            />
            <StatsCard
              icon={Trophy}
              label="Quizzes Taken"
              value={stats.totalQuizzes}
              color="yellow"
            />
            <StatsCard
              icon={TrendingUp}
              label="Avg. Score"
              value={`${stats.averageScore || 0}%`}
              color="purple"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onContinue={() => handleContinueCourse(course)}
                onDelete={(e) => handleDelete(course.id, e)}
                onPublish={(e) => handlePublishClick(course, e)}
                isDeleting={deletingId === course.id}
              />
            ))}
          </div>
        )}

        {/* Publish Modal */}
        <PublishModal
          course={publishModalCourse}
          isOpen={!!publishModalCourse}
          onClose={() => setPublishModalCourse(null)}
          onPublished={handlePublished}
        />
      </main>
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          <p className="text-sm text-neutral-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, index, onContinue, onDelete, onPublish, isDeleting }) {
  const progressPercentage = course.progressPercentage || 0;
  const isPublic = course.isPublic || course.is_public;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer"
      onClick={onContinue}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-neutral-100 to-neutral-200">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-neutral-300" />
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {course.completed && (
            <div className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Completed
            </div>
          )}
          {isPublic && (
            <div className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Public
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          {/* Delete button */}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 bg-white/90 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-white transition-all"
            title="Delete course"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
          
          {/* Publish button */}
          <button
            onClick={onPublish}
            className={`p-2 bg-white/90 rounded-lg transition-all hover:bg-white ${
              isPublic 
                ? 'text-blue-500 hover:text-blue-600' 
                : 'text-neutral-500 hover:text-blue-500'
            }`}
            title={isPublic ? 'Manage publication' : 'Publish to marketplace'}
          >
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2 mb-2 group-hover:text-[#1DA1F2] transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.selectedChapterCount} chapters
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.chapterDuration}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-neutral-500">Progress</span>
            <span className="font-medium text-neutral-900">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-[#1DA1F2] to-blue-600 rounded-full"
            />
          </div>
        </div>

        {/* Continue button */}
        <button className="w-full py-2.5 flex items-center justify-center gap-2 text-[#1DA1F2] font-medium border border-[#1DA1F2]/20 rounded-xl hover:bg-[#1DA1F2]/5 transition-colors">
          {course.completed ? 'Review Course' : 'Continue Learning'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 bg-neutral-100 rounded-2xl flex items-center justify-center">
        <BookOpen className="w-10 h-10 text-neutral-300" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        No courses yet
      </h3>
      <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
        Start your learning journey by creating your first AI-generated course.
      </p>
      <Link
        to="/setup"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DA1F2] text-white font-semibold rounded-xl hover:bg-[#1a8cd8] transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Your First Course
      </Link>
    </div>
  );
}

export default MyCoursesPage;
