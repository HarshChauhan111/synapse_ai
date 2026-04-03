import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Maximize2, Minimize2, Code, Sparkles, Loader2 } from 'lucide-react';
import { generateVisualization } from '../../api/gemini';

/**
 * GeminiVisualization - Renders AI-generated HTML/CSS/JS visualizations
 * Uses Gemini to generate interactive charts, diagrams, and animations
 */
function GeminiVisualization({ topic, type = 'diagram', accentColor, data = null }) {
  const [vizData, setVizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);

  /**
   * Generate the visualization using Gemini
   */
  const generateViz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateVisualization(type, topic, data);
      setVizData(result);
    } catch (err) {
      setError(err.message || 'Failed to generate visualization');
    } finally {
      setLoading(false);
    }
  }, [type, topic, data]);

  /**
   * Build a self-contained HTML document for the iframe using srcdoc
   */
  const iframeContent = useMemo(() => {
    if (!vizData) return '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0f;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      overflow: auto;
    }
    ${vizData.css || ''}
  </style>
</head>
<body>
  ${vizData.html || ''}
  <script>
    try {
      ${vizData.js || ''}
    } catch(e) {
      console.error('Visualization script error:', e);
    }
  </script>
</body>
</html>`;
  }, [vizData]);

  // Not yet generated - show trigger button
  if (!vizData && !loading && !error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-8"
      >
        <button
          onClick={generateViz}
          className="group w-full flex items-center gap-4 p-5 rounded-xl transition-all duration-300 hover:scale-[1.01]"
          style={{
            background: `linear-gradient(135deg, ${accentColor}10 0%, ${accentColor}05 100%)`,
            borderColor: `${accentColor}30`,
            borderWidth: 1,
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Sparkles className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <div className="text-left flex-1">
            <h5 className="text-white font-semibold text-sm">
              Generate Interactive {type === 'chart' ? 'Chart' : type === 'animation' ? 'Animation' : 'Diagram'}
            </h5>
            <p className="text-white/50 text-xs mt-0.5">
              AI-powered visualization for "{topic}"
            </p>
          </div>
          <Play className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`my-8 rounded-xl overflow-hidden ${isExpanded ? 'fixed inset-4 z-50' : 'relative'}`}
      style={{
        borderColor: `${accentColor}30`,
        borderWidth: 1,
        backgroundColor: '#0a0a0f',
      }}
    >
      {/* Expanded backdrop */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${accentColor}20` }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-sm font-medium text-white/80">
            {vizData?.title || `AI ${type}`}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
            Gemini
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle code */}
          {vizData && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
              title="View source code"
            >
              <Code className="w-4 h-4" />
            </button>
          )}

          {/* Regenerate */}
          <button
            onClick={generateViz}
            disabled={loading}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Regenerate"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className={`relative ${isExpanded ? 'h-[calc(100%-48px)]' : ''}`}>
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8" style={{ color: accentColor }} />
            </motion.div>
            <p className="text-sm text-white/50">Generating visualization with AI...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={generateViz}
              className="text-sm px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Visualization iframe */}
        {vizData && !loading && (
          <AnimatePresence mode="wait">
            {showCode ? (
              <motion.div
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`overflow-auto ${isExpanded ? 'h-full' : 'max-h-[400px]'}`}
              >
                <pre className="p-4 text-xs text-white/70 font-mono">
                  <code>
                    {`/* HTML */\n${vizData.html || ''}\n\n/* CSS */\n${vizData.css || ''}\n\n/* JavaScript */\n${vizData.js || ''}`}
                  </code>
                </pre>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={isExpanded ? 'h-full' : ''}
              >
                <iframe
                  title={vizData.title || 'AI Visualization'}
                  srcDoc={iframeContent}
                  className={`w-full border-0 ${isExpanded ? 'h-full' : ''}`}
                  style={{ 
                    minHeight: isExpanded ? '100%' : '350px',
                    background: '#0a0a0f',
                  }}
                  sandbox="allow-scripts"
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Description */}
      {vizData?.description && !showCode && !loading && (
        <div
          className="px-4 py-2 text-xs text-white/50"
          style={{ borderTop: `1px solid ${accentColor}15` }}
        >
          {vizData.description}
        </div>
      )}
    </motion.div>
  );
}

export default GeminiVisualization;
