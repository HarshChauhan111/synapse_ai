import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import { CircularProgress } from '../common/ProgressBar';

function QuizResult({ score, detailedResults, onContinue, onRetry }) {
  const { correct, total, totalQuestions, percentage } = score;

  // Determine grade and message
  const getGrade = () => {
    if (percentage >= 90) return { grade: 'Excellent!', emoji: '🏆', color: '#10b981' };
    if (percentage >= 70) return { grade: 'Good Job!', emoji: '👍', color: '#3b82f6' };
    if (percentage >= 50) return { grade: 'Keep Going!', emoji: '💪', color: '#f59e0b' };
    return { grade: 'Needs Review', emoji: '📚', color: '#ef4444' };
  };

  const { grade, emoji, color } = getGrade();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto space-y-8"
    >
      {/* Score header */}
      <motion.div
        variants={itemVariants}
        className="text-center glass-card p-8 rounded-2xl"
      >
        {/* Circular progress */}
        <div className="mb-6">
          <CircularProgress
            progress={correct}
            total={total}
            size={160}
            strokeWidth={12}
            color={color}
          />
        </div>

        {/* Grade badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <span className="text-2xl">{emoji}</span>
          <span>{grade}</span>
        </motion.div>

        {/* Score text */}
        <p className="text-white/70">
          You answered{' '}
          <span className="font-bold text-white">{correct}</span> out of{' '}
          <span className="font-bold text-white">{total}</span> questions
          correctly
        </p>
        
        {/* Additional stats for continuous quiz */}
        {totalQuestions && totalQuestions !== total && (
          <p className="text-sm text-white/50 mt-2">
            {total} questions answered from {totalQuestions} loaded
          </p>
        )}
      </motion.div>

      {/* Results breakdown */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h4 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-primary" />
          Question Review ({detailedResults.length} answered)
        </h4>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {detailedResults.map((result, index) => (
            <motion.div
              key={result.questionNumber}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`
                p-4 rounded-xl border
                ${result.isCorrect
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-red-500/5 border-red-500/20'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${result.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}
                  `}
                >
                  {result.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                {/* Question details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 mb-2 line-clamp-2">
                    <span className="text-white/50">Q{result.questionNumber}:</span>{' '}
                    {result.question}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {result.userAnswer && (
                      <span
                        className={`
                          px-2 py-1 rounded
                          ${result.isCorrect
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                          }
                        `}
                      >
                        Your answer: {result.userAnswer}
                      </span>
                    )}
                    {!result.isCorrect && (
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
                        Correct: {result.correctAnswer}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button 
          onClick={onRetry} 
          variant="secondary" 
          size="lg"
          icon={RotateCcw}
        >
          New Quiz
        </Button>
        <Button
          onClick={onContinue}
          size="lg"
          glow
          icon={ArrowRight}
          iconPosition="right"
        >
          Continue Learning
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default QuizResult;
