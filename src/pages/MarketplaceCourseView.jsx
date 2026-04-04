import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Eye, Clock, BookOpen, User, Bookmark, BookmarkCheck,
  Share2, Play, Loader2, AlertCircle
} from 'lucide-react';
import { marketplaceAPI } from '../api/backend';

const MarketplaceCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await marketplaceAPI.getCourse(courseId);
        setCourse(response.course);
        
        // Record view
        await marketplaceAPI.recordView(courseId);
      } catch (err) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleSave = async () => {
    try {
      if (isSaved) {
        await marketplaceAPI.unsaveCourse(courseId);
        setIsSaved(false);
      } else {
        await marketplaceAPI.saveCourse(courseId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStartCourse = () => {
    // Clone course to user's library or just view it
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Marketplace
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden mb-6">
              {course.thumbnailUrl ? (
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={64} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Title & meta */}
            <div className="mb-6">
              {course.category && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs 
                               font-medium rounded-md mb-2">
                  {course.category}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {course.viewCount?.toLocaleString() || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={16} />
                  {course.chapterCount || 0} chapters
                </span>
                {course.chapterDuration && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {course.chapterDuration} per chapter
                  </span>
                )}
                {course.difficultyLevel && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                  ${difficultyColors[course.difficultyLevel.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                    {course.difficultyLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {course.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About this course</h2>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </div>
            )}

            {/* Chapters preview */}
            {course.chaptersData && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Course Content</h2>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {(() => {
                    // chaptersData can be an object with numeric keys or an array
                    const chapters = Array.isArray(course.chaptersData) 
                      ? course.chaptersData 
                      : Object.keys(course.chaptersData)
                          .sort((a, b) => parseInt(a) - parseInt(b))
                          .map(key => course.chaptersData[key]);
                    
                    return (
                      <>
                        {chapters.slice(0, 5).map((chapter, index) => (
                          <div key={index} className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center 
                                          text-sm font-medium text-gray-600">
                              {index + 1}
                            </div>
                            <span className="text-gray-800">{chapter?.title || chapter?.chapterTitle || `Chapter ${index + 1}`}</span>
                          </div>
                        ))}
                        {chapters.length > 5 && (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            + {chapters.length - 5} more chapters
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              {/* Creator */}
              {course.creator && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  {course.creator.avatarUrl ? (
                    <img 
                      src={course.creator.avatarUrl}
                      alt={course.creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Created by</p>
                    <p className="font-medium text-gray-900">
                      {course.creator.name || course.creator.username || 'Anonymous'}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <button
                onClick={handleStartCourse}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium 
                         hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <Play size={18} />
                Start Learning
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2
                             border transition-colors
                             ${isSaved 
                               ? 'bg-blue-50 border-blue-200 text-blue-600' 
                               : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium 
                           text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCourseView;
