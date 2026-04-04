import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImageOff } from 'lucide-react';
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
            className="mt-3 !p-4 !rounded-xl bg-neutral-50 border border-neutral-200"
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
            className="mt-3 !p-4 !rounded-xl bg-neutral-50 border border-neutral-200"
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
            className="mt-3 !p-4 !rounded-xl bg-neutral-50 border border-neutral-200"
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
            className="mt-3 !p-4 !rounded-xl bg-neutral-50 border border-neutral-200"
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
            className="mt-3 !p-4 !rounded-xl bg-neutral-50 border border-neutral-200"
          />
        </motion.div>
      );

    case 'image':
      if (imageLoading) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-xl overflow-hidden bg-neutral-100 animate-pulse h-32"
          />
        );
      }
      if (imageError || !imageData) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-xl overflow-hidden bg-neutral-100 h-32 flex items-center justify-center"
          >
            <ImageOff className="w-8 h-8 text-neutral-300" />
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
            <p className="text-xs text-neutral-500 mt-1.5 px-1">{data.caption}</p>
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
  const { role, content, visual } = message;
  const isUser = role === 'user';

  // Handle both string content and object content (from new visual API)
  const textContent = typeof content === 'object' ? content.text : content;
  const visualData = typeof content === 'object' ? content.visual : visual;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`mb-3 flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[90%] px-4 py-2.5 text-[14px] font-medium shadow-sm transition-colors duration-200 sm:max-w-[85%] sm:px-5 sm:py-3 sm:text-[15px] ${
          isUser
            ? 'rounded-[16px] rounded-br-[4px] border border-neutral-100 bg-white text-neutral-800'
            : 'rounded-[16px] rounded-bl-[4px] border border-sky-400/20 bg-[#1DA1F2] text-white shadow-sky-500/10'
        }`}
      >
        {/* Content */}
        {isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap">
            {textContent}
          </p>
        ) : (
          <>
            <div className="leading-relaxed text-white [&_p]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_li]:text-white [&_strong]:text-white [&_em]:text-white [&_a]:text-sky-100 [&_code]:text-sky-100 [&_code]:bg-sky-600/30 [&_pre]:bg-sky-600/20 [&_pre]:p-3 [&_pre]:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {textContent || ''}
              </ReactMarkdown>
            </div>
            
            {/* Visual content with enhanced animations */}
            {visualData && <ChatVisual visual={visualData} />}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;
