import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

function QuizQuestion({
  question,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  isLoadingMore = false,
  isLastQuestion = false,
}) {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setHasAnswered(false);
    setIsCorrect(false);
  }, [question?.questionNumber]);

  if (!question) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-neutral-500">Loading question...</p>
      </div>
    );
  }

  const handleSelect = (option) => {
    if (hasAnswered) return;
    
    onSelectAnswer(option);
    setHasAnswered(true);
    setIsCorrect(option === question.correctAnswer);
  };

  const getOptionStyle = (option) => {
    if (!hasAnswered) {
      return selectedAnswer === option
        ? 'border-blue-500 bg-blue-50'
        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50';
    }

    if (option === question.correctAnswer) {
      return 'border-green-500 bg-green-50';
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-neutral-200 bg-neutral-50 opacity-50';
  };

  const questionVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <motion.div
      key={question.questionNumber}
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Question type badge */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
            ${question.type === 'mcq'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-amber-100 text-amber-700'
            }
          `}
        >
          {question.type === 'mcq' ? 'Multiple Choice' : 'True / False'}
        </span>
        <span className="text-xs text-neutral-400">
          Q{question.questionNumber}
        </span>
      </div>

      {/* Question text */}
      <h3 className="text-xl md:text-2xl font-heading font-bold text-neutral-900 mb-8 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <motion.button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={hasAnswered}
            whileHover={!hasAnswered ? { scale: 1.01 } : undefined}
            whileTap={!hasAnswered ? { scale: 0.99 } : undefined}
            className={`
              w-full p-4 rounded-xl text-left transition-all duration-200
              border-2 ${getOptionStyle(option)}
              ${!hasAnswered ? 'cursor-pointer' : 'cursor-default'}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Option letter */}
              <span
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                  ${hasAnswered && option === question.correctAnswer
                    ? 'bg-green-500 text-white'
                    : hasAnswered && option === selectedAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }
                `}
              >
                {String.fromCharCode(65 + index)}
              </span>

              {/* Option text */}
              <span className="flex-1 text-neutral-900">{option}</span>

              {/* Result icon */}
              {hasAnswered && option === question.correctAnswer && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </motion.div>
              )}
              {hasAnswered && option === selectedAnswer && option !== question.correctAnswer && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <XCircle className="w-6 h-6 text-red-500" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Explanation (shown after answering) */}
      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              p-4 rounded-xl mb-8 flex items-start gap-3
              ${isCorrect
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
              }
            `}
          >
            <AlertCircle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
            />
            <div>
              <p
                className={`font-medium mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
              >
                {isCorrect ? 'Correct!' : 'Not quite right'}
              </p>
              <p className="text-sm text-neutral-600">{question.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-3"
        >
          <Button 
            onClick={onNext} 
            size="lg" 
            glow
            disabled={isLoadingMore && isLastQuestion}
          >
            {isLoadingMore && isLastQuestion ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading more questions...
              </>
            ) : (
              <>
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default QuizQuestion;
