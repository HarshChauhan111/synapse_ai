import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, TrendingUp, BookOpen, Bookmark, 
  ChevronDown, X, Loader2, Store
} from 'lucide-react';
import CourseCard from '../components/marketplace/CourseCard';
import { marketplaceAPI } from '../api/backend';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedCourseIds, setSavedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    sort: 'recent'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch courses
  const fetchCourses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await marketplaceAPI.getCourses({
        page,
        limit: 12,
        sort: filters.sort,
        category: filters.category || undefined,
        difficulty: filters.difficulty || undefined
      });
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch trending courses
  const fetchTrending = useCallback(async () => {
    try {
      const response = await marketplaceAPI.getTrending(6);
      setTrendingCourses(response.courses);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await marketplaceAPI.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // Fetch saved courses
  const fetchSaved = useCallback(async () => {
    try {
      const response = await marketplaceAPI.getSavedCourses();
      setSavedCourseIds(new Set(response.courses.map(c => c.id)));
    } catch (error) {
      // User might not be logged in
      console.log('Could not fetch saved courses');
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchTrending();
    fetchCategories();
    fetchSaved();
  }, [fetchCourses, fetchTrending, fetchCategories, fetchSaved]);

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchCourses();
      return;
    }
    
    setLoading(true);
    try {
      const response = await marketplaceAPI.search(searchQuery);
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // View course
  const handleViewCourse = (courseId) => {
    navigate(`/marketplace/course/${courseId}`);
  };

  // Save/unsave course
  const handleSaveCourse = async (courseId, save) => {
    try {
      if (save) {
        await marketplaceAPI.saveCourse(courseId);
        setSavedCourseIds(prev => new Set([...prev, courseId]));
      } else {
        await marketplaceAPI.unsaveCourse(courseId);
        setSavedCourseIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  // Filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ category: '', difficulty: '', sort: 'recent' });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.category || filters.difficulty || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Course Marketplace</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Discover courses created by the community
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-xl flex items-center gap-2 transition-colors
                        ${showFilters ? 'bg-gray-100 border-gray-300' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </form>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-wrap gap-4">
                {/* Category filter */}
                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty filter */}
                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="min-w-[160px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="self-end px-3 py-2 text-sm text-gray-600 hover:text-gray-900 
                             flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending section */}
        {!searchQuery && !hasActiveFilters && trendingCourses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Trending This Week</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCourses.slice(0, 3).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onView={handleViewCourse}
                  onSave={handleSaveCourse}
                  isSaved={savedCourseIds.has(course.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Courses'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pagination.totalCount} courses)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No courses found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to publish a course!'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onView={handleViewCourse}
                    onSave={handleSaveCourse}
                    isSaved={savedCourseIds.has(course.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => fetchCourses(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 
                             disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchCourses(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 
                             disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default MarketplacePage;
