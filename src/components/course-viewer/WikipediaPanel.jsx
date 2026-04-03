import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, ChevronUp, ExternalLink, BookOpen } from 'lucide-react';
import { getWikipediaSummary } from '../../api/wikipediaApi';

/**
 * Wikipedia Knowledge Panel - Shows relevant Wikipedia summary for a topic
 * Displayed as an expandable card in chapter sections
 */
function WikipediaPanel({ topic, accentColor }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!topic) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const summary = await getWikipediaSummary(topic);
        if (!cancelled && summary) {
          setData(summary);
        }
      } catch (err) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [topic]);

  if (loading) {
    return (
      <div className="my-6 rounded-xl bg-white/5 h-20 animate-pulse" />
    );
  }

  if (error || !data) return null;

  // Truncate extract for collapsed view
  const shortExtract = data.extract?.length > 200
    ? data.extract.substring(0, 200) + '...'
    : data.extract;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-6 rounded-xl overflow-hidden"
      style={{
        backgroundColor: `${accentColor}08`,
        borderColor: `${accentColor}25`,
        borderWidth: 1,
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/5"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Globe className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              Wikipedia
            </span>
            <h5 className="text-sm font-semibold text-white truncate">
              {data.title}
            </h5>
          </div>
          {!expanded && (
            <p className="text-xs text-white/50 mt-1 line-clamp-1">
              {shortExtract}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-white/40">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Image + text layout */}
              <div className={`flex gap-4 ${data.thumbnail ? 'flex-row' : ''}`}>
                {data.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={data.thumbnail}
                      alt={data.title}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <p className="text-sm text-white/70 leading-relaxed flex-1">
                  {data.extract}
                </p>
              </div>

              {/* Read more link */}
              {data.url && (
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-full"
                  style={{
                    color: accentColor,
                    backgroundColor: `${accentColor}15`,
                  }}
                >
                  <BookOpen className="w-3 h-3" />
                  Read full article on Wikipedia
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default WikipediaPanel;
