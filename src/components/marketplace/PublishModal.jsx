import React, { useState } from 'react';
import { X, Globe, Lock, Tag, Loader2 } from 'lucide-react';
import { marketplaceAPI } from '../../api/backend';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile Development',
  'DevOps',
  'Cybersecurity',
  'Design',
  'Business',
  'Marketing',
  'Finance',
  'Science',
  'Mathematics',
  'Languages',
  'Other'
];

const PublishModal = ({ course, isOpen, onClose, onPublished }) => {
  const [category, setCategory] = useState(course?.category || '');
  const [tagsInput, setTagsInput] = useState((course?.tags || []).join(', '));
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setError(null);
    setPublishing(true);

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      await marketplaceAPI.publishCourse(course.id, { category, tags });
      onPublished?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setError(null);
    setPublishing(true);

    try {
      await marketplaceAPI.unpublishCourse(course.id);
      onPublished?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to unpublish course');
    } finally {
      setPublishing(false);
    }
  };

  const isPublished = course?.isPublic || course?.is_public;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {isPublished ? (
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
          ) : (
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isPublished ? 'Course Published' : 'Publish to Marketplace'}
            </h2>
            <p className="text-sm text-gray-500">
              {isPublished 
                ? 'Your course is visible to everyone'
                : 'Share your course with the community'}
            </p>
          </div>
        </div>

        {/* Course info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-1">{course?.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{course?.description}</p>
        </div>

        {!isPublished && (
          <>
            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={14} className="inline mr-1" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g., python, beginner, web"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add tags to help others discover your course
              </p>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {isPublished ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium
                         text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleUnpublish}
                disabled={publishing}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium
                         hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {publishing && <Loader2 size={16} className="animate-spin" />}
                Unpublish
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium
                         text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium
                         hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {publishing && <Loader2 size={16} className="animate-spin" />}
                Publish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
