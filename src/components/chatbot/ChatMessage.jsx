import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, ImageOff } from 'lucide-react';
import VisualChart from '../course-viewer/VisualChart';
import VisualTimeline from '../course-viewer/VisualTimeline';
import VisualProcessFlow from '../course-viewer/VisualProcessFlow';
import VisualTable from '../course-viewer/VisualTable';
import VisualInfographic from '../course-viewer/VisualInfographic';
import { getSectionImage } from '../../api/imageSearch';

// Visual renderer for chat messages
function ChatVisual({ visual }) {
  const [imageData, setImageData] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (visual?.type === 'image' && visual?.data?.searchQuery) {
      setImageLoading(true);
      getSectionImage(visual.data.searchQuery, visual.data.imageType || 'auto')
        .then(img => {
          setImageData(img);
          setImageLoading(false);
        })
        .catch(() => {
          setImageError(true);
          setImageLoading(false);
        });
    }
  }, [visual]);

  if (!visual || !visual.type) return null;

  const { type, data } = visual;

  switch (type) {
    case 'chart':
      return (
        <VisualChart
          type={data.chartType || 'bar'}
          data={data.data}
          title={data.title}
          description={data.description}
          compact
          className="mt-3"
        />
      );

    case 'timeline':
      return (
        <VisualTimeline
          events={data.events}
          title={data.title}
          compact
          className="mt-3"
        />
      );

    case 'process':
      return (
        <VisualProcessFlow
          steps={data.steps}
          title={data.title}
          compact
          className="mt-3"
        />
      );

    case 'table':
      return (
        <VisualTable
          columns={data.columns}
          rows={data.rows}
          title={data.title}
          compact
          className="mt-3"
        />
      );

    case 'infographic':
      return (
        <VisualInfographic
          stats={data.stats}
          title={data.title}
          layout="row"
          className="mt-3"
        />
      );

    case 'image':
      if (imageLoading) {
        return (
          <div className="mt-3 rounded-lg overflow-hidden bg-white/5 animate-pulse h-32" />
        );
      }
      if (imageError || !imageData) {
        return (
          <div className="mt-3 rounded-lg overflow-hidden bg-white/5 h-32 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-white/20" />
          </div>
        );
      }
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={imageData.url || imageData.thumbnail}
            alt={data.caption || data.searchQuery}
            className="w-full h-auto rounded-lg"
            onError={() => setImageError(true)}
          />
          {data.caption && (
            <p className="text-xs text-white/50 mt-1">{data.caption}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}

function ChatMessage({ message }) {
  const { role, content, timestamp, visual } = message;
  const isUser = role === 'user';

  // Handle both string content and object content (from new visual API)
  const textContent = typeof content === 'object' ? content.text : content;
  const visualData = typeof content === 'object' ? content.visual : visual;

  const messageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          flex gap-2 max-w-[85%]
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}
      >
        {/* Avatar */}
        <div
          className={`
            w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
            ${isUser
              ? 'bg-gradient-to-br from-accent-primary to-accent-secondary'
              : 'bg-white/10'
            }
          `}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-accent-primary" />
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${isUser
              ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-br-md'
              : 'glass-card text-white/90 rounded-bl-md'
            }
          `}
        >
          {/* Content */}
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {textContent}
            </p>
          ) : (
            <>
              <div className="text-sm leading-relaxed markdown-content prose prose-sm prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {textContent || ''}
                </ReactMarkdown>
              </div>
              
              {/* Visual content */}
              {visualData && <ChatVisual visual={visualData} />}
            </>
          )}

          {/* Timestamp */}
          <p
            className={`
              text-[10px] mt-1
              ${isUser ? 'text-white/60 text-right' : 'text-white/40'}
            `}
          >
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ChatMessage;
