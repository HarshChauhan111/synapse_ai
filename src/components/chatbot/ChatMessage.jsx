import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles, ImageOff } from 'lucide-react';
import VisualChart from '../course-viewer/VisualChart';
import VisualTimeline from '../course-viewer/VisualTimeline';
import VisualProcessFlow from '../course-viewer/VisualProcessFlow';
import VisualTable from '../course-viewer/VisualTable';
import VisualInfographic from '../course-viewer/VisualInfographic';
import AlgorithmAnimation from '../course-viewer/AlgorithmAnimation';
import { getSectionImage } from '../../api/imageSearch';

// Visual renderer for chat messages with enhanced animations
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

  const visualVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2,
      },
    },
  };

  switch (type) {
    case 'chart':
      return (
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
        >
          <VisualChart
            type={data.chartType || 'bar'}
            data={data.data}
            title={data.title}
            description={data.description}
            compact
            animate
            className="mt-3 !p-4 !rounded-xl bg-white/[0.02] border border-white/[0.05]"
          />
        </motion.div>
      );

    case 'timeline':
      return (
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
        >
          <VisualTimeline
            events={data.events}
            title={data.title}
            compact
            className="mt-3 !p-4 !rounded-xl bg-white/[0.02] border border-white/[0.05]"
          />
        </motion.div>
      );

    case 'process':
      return (
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
        >
          <VisualProcessFlow
            steps={data.steps}
            title={data.title}
            compact
            className="mt-3 !p-4 !rounded-xl bg-white/[0.02] border border-white/[0.05]"
          />
        </motion.div>
      );

    case 'table':
      return (
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
        >
          <VisualTable
            columns={data.columns}
            rows={data.rows}
            title={data.title}
            compact
            className="mt-3 !p-4 !rounded-xl bg-white/[0.02] border border-white/[0.05]"
          />
        </motion.div>
      );

    case 'infographic':
      return (
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
        >
          <VisualInfographic
            stats={data.stats}
            title={data.title}
            layout="row"
            className="mt-3 !p-4 !rounded-xl bg-white/[0.02] border border-white/[0.05]"
          />
        </motion.div>
      );

    case 'image':
      if (imageLoading) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-xl overflow-hidden bg-white/[0.02] animate-pulse h-32"
          />
        );
      }
      if (imageError || !imageData) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-xl overflow-hidden bg-white/[0.02] h-32 flex items-center justify-center"
          >
            <ImageOff className="w-8 h-8 text-white/20" />
          </motion.div>
        );
      }
      return (
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
          className="mt-3 rounded-xl overflow-hidden"
        >
          <img
            src={imageData.url || imageData.thumbnail}
            alt={data.caption || data.searchQuery}
            className="w-full h-auto rounded-xl"
            onError={() => setImageError(true)}
          />
          {data.caption && (
            <p className="text-xs text-white/50 mt-1.5 px-1">{data.caption}</p>
          )}
        </motion.div>
      );

    case 'algorithm':
      return (
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
        >
          <AlgorithmAnimation
            algorithm={data.algorithm || 'bubble'}
            initialArray={data.initialArray}
            title={data.title}
            compact={data.compact}
            className="mt-3"
          />
        </motion.div>
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
      y: 15,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.15 },
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
          flex gap-2.5 max-w-[90%]
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}
      >
        {/* Avatar - minimalist style */}
        <div
          className={`
            w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center
            ${isUser
              ? 'bg-white/10'
              : 'bg-white/[0.03] border border-white/[0.08]'
            }
          `}
        >
          {isUser ? (
            <User className="w-3.5 h-3.5 text-white/60" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-accent-primary/80" />
          )}
        </div>

        {/* Message bubble - minimalist style */}
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${isUser
              ? 'bg-white/10 text-white/90 rounded-tr-md'
              : 'bg-white/[0.03] border border-white/[0.06] text-white/85 rounded-tl-md'
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
              
              {/* Visual content with enhanced animations */}
              {visualData && <ChatVisual visual={visualData} />}
            </>
          )}

          {/* Timestamp */}
          <p
            className={`
              text-[10px] mt-1.5
              ${isUser ? 'text-white/40 text-right' : 'text-white/30'}
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
