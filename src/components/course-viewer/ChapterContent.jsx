import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lightbulb, CheckCircle, BookOpen } from 'lucide-react';

function ChapterContent({ chapterData, chapterIndex }) {
  const {
    sections,
    keyTakeaways,
    chapterSummary,
    accentColor,
  } = chapterData;

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Sections */}
      {sections.map((section, index) => (
        <motion.section
          key={index}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-4"
        >
          {/* Section heading */}
          <h3 className="text-2xl font-heading font-bold text-white">
            {section.heading}
          </h3>

          {/* Section body - markdown */}
          <div className="markdown-content text-white/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {section.body}
            </ReactMarkdown>
          </div>

          {/* Callout box */}
          {section.hasCallout && section.calloutText && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="callout-box"
              style={{
                backgroundColor: `${accentColor}15`,
                borderLeft: `4px solid ${accentColor}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accentColor}30` }}
              >
                <Lightbulb
                  className="w-4 h-4"
                  style={{ color: accentColor }}
                />
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                {section.calloutText}
              </p>
            </motion.div>
          )}
        </motion.section>
      ))}

      {/* Key Takeaways */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-6 rounded-2xl space-y-4"
        style={{
          borderColor: `${accentColor}40`,
          borderWidth: 1,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <h4 className="text-xl font-heading font-bold text-white">
            Key Takeaways
          </h4>
        </div>

        <ul className="space-y-3">
          {keyTakeaways.map((takeaway, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: accentColor }}
              >
                <span className="text-white text-xs font-bold">
                  {index + 1}
                </span>
              </motion.div>
              <span className="text-white/80">{takeaway}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Chapter Summary */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative p-6 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 100%)`,
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <h4 className="text-xl font-heading font-bold text-white">
              Chapter Summary
            </h4>
          </div>

          <p className="text-white/70 leading-relaxed pl-13">
            {chapterSummary}
          </p>
        </div>
      </motion.div>

      {/* Bottom spacer for pagination */}
      <div className="h-8" />
    </div>
  );
}

export default ChapterContent;
