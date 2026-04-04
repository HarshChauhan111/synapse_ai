import React from 'react';
import { Eye, Clock, BookOpen, User, Bookmark, BookmarkCheck } from 'lucide-react';

const CourseCard = ({ 
  course, 
  onView, 
  onSave, 
  isSaved = false,
  showSaveButton = true,
  className = '' 
}) => {
  const {
    id,
    title,
    description,
    thumbnailUrl,
    difficultyLevel,
    chapterCount,
    viewCount,
    chapterDuration,
    creator,
    category
  } = course;

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave?.(id, !isSaved);
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden 
                  hover:shadow-md transition-all duration-300 cursor-pointer group ${className}`}
      onClick={() => onView?.(id)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={48} className="text-gray-300" />
          </div>
        )}
        
        {/* Category badge */}
        {category && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm 
                          text-xs font-medium text-gray-700 rounded-md shadow-sm">
            {category}
          </span>
        )}

        {/* Save button */}
        {showSaveButton && (
          <button
            onClick={handleSaveClick}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all
                       ${isSaved 
                         ? 'bg-blue-500 text-white' 
                         : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'}`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        )}

        {/* View count overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 
                        bg-black/60 backdrop-blur-sm text-white text-xs rounded-md">
          <Eye size={12} />
          <span>{viewCount?.toLocaleString() || 0}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Difficulty badge */}
        {difficultyLevel && (
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2
                           ${difficultyColors[difficultyLevel.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
            {difficultyLevel}
          </span>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {chapterCount || 0} chapters
            </span>
            {chapterDuration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {chapterDuration}
              </span>
            )}
          </div>
        </div>

        {/* Creator */}
        {creator && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {creator.avatarUrl ? (
              <img 
                src={creator.avatarUrl} 
                alt={creator.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={12} className="text-gray-500" />
              </div>
            )}
            <span className="text-sm text-gray-600 truncate">
              {creator.name || creator.username || 'Anonymous'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
