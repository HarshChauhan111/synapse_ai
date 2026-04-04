import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

/**
 * DynamicAnimation - A versatile animation component for educational content
 * Supports: process_flow, algorithm_stepper, timeline, comparison, system_flow, conceptual_transition
 */

// Process Flow Animation - Shows step-by-step procedures
function ProcessFlowAnimation({ steps, currentStep, accentColor }) {
  return (
    <div className="relative py-8">
      {/* Progress line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2" />
      <motion.div
        className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: accentColor }}
        initial={{ width: '0%' }}
        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5 }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.4,
              y: 0,
              scale: index === currentStep ? 1.1 : 1
            }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Step circle */}
            <motion.div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                index <= currentStep 
                  ? 'text-white border-transparent' 
                  : 'bg-white text-neutral-400 border-neutral-200'
              }`}
              style={{ 
                backgroundColor: index <= currentStep ? accentColor : undefined 
              }}
              animate={{
                boxShadow: index === currentStep 
                  ? `0 0 20px ${accentColor}40` 
                  : 'none'
              }}
            >
              {index + 1}
            </motion.div>

            {/* Step content */}
            <div className="mt-4 text-center max-w-[120px]">
              <p className={`text-sm font-medium ${
                index <= currentStep ? 'text-neutral-900' : 'text-neutral-400'
              }`}>
                {step.title || step.visual_state}
              </p>
              {index === currentStep && step.explanation && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-neutral-500 mt-1"
                >
                  {step.explanation}
                </motion.p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Algorithm Stepper Animation - Shows algorithm execution
function AlgorithmStepperAnimation({ steps, currentStep, accentColor }) {
  const step = steps[currentStep];
  
  return (
    <div className="space-y-6">
      {/* Visual state display */}
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <div className="flex flex-wrap gap-2 justify-center min-h-[80px] items-center">
          {step.visual_state && typeof step.visual_state === 'string' ? (
            // Parse visual state if it's a string representation of array
            step.visual_state.match(/\d+/g)?.map((num, idx) => (
              <motion.div
                key={idx}
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ 
                  backgroundColor: step.highlight?.includes(idx) ? accentColor : '#6b7280',
                  height: `${Math.max(40, parseInt(num) * 4)}px`
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: step.highlight?.includes(idx) ? 1.1 : 1,
                  opacity: 1
                }}
                transition={{ duration: 0.3 }}
              >
                {num}
              </motion.div>
            ))
          ) : Array.isArray(step.visual_state) ? (
            step.visual_state.map((item, idx) => (
              <motion.div
                key={idx}
                className="px-4 py-2 rounded-lg text-white font-bold"
                style={{ 
                  backgroundColor: step.highlight?.includes(idx) ? accentColor : '#6b7280'
                }}
                initial={{ scale: 0.8 }}
                animate={{ scale: step.highlight?.includes(idx) ? 1.1 : 1 }}
              >
                {item}
              </motion.div>
            ))
          ) : (
            <p className="text-neutral-600">{step.visual_state}</p>
          )}
        </div>
      </div>

      {/* Current step explanation */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl p-4 border border-neutral-200"
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <span style={{ color: accentColor }} className="font-bold text-sm">
              {currentStep + 1}
            </span>
          </div>
          <p className="text-neutral-700 text-sm">{step.explanation}</p>
        </div>
      </motion.div>
    </div>
  );
}

// Timeline Animation - Shows chronological events
function TimelineAnimation({ steps, currentStep, accentColor }) {
  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-neutral-200" />
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.3,
              x: 0 
            }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Timeline dot */}
            <motion.div
              className="absolute -left-5 w-4 h-4 rounded-full border-2"
              style={{ 
                backgroundColor: index <= currentStep ? accentColor : 'white',
                borderColor: index <= currentStep ? accentColor : '#e5e5e5'
              }}
              animate={{
                scale: index === currentStep ? 1.3 : 1,
                boxShadow: index === currentStep ? `0 0 12px ${accentColor}60` : 'none'
              }}
            />

            {/* Content */}
            <div className={`bg-white rounded-xl p-4 border transition-all ${
              index === currentStep ? 'border-2 shadow-lg' : 'border-neutral-200'
            }`}
            style={{ borderColor: index === currentStep ? accentColor : undefined }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${accentColor}15`,
                    color: accentColor 
                  }}
                >
                  {step.year || step.time || `Step ${index + 1}`}
                </span>
                <h4 className="font-semibold text-neutral-900">{step.title}</h4>
              </div>
              {index === currentStep && step.explanation && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-neutral-600"
                >
                  {step.explanation}
                </motion.p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Comparison Animation - Shows side-by-side comparisons
function ComparisonAnimation({ steps, currentStep, accentColor }) {
  const step = steps[currentStep];
  const items = step.items || [step.left, step.right].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-xl p-5 border border-neutral-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <h4 
              className="font-bold text-lg mb-2"
              style={{ color: idx === 0 ? accentColor : '#6b7280' }}
            >
              {item.title || item.name}
            </h4>
            <p className="text-neutral-600 text-sm">{item.description || item.value}</p>
          </motion.div>
        ))}
      </div>
      
      {step.explanation && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-neutral-500 bg-neutral-50 rounded-lg p-3"
        >
          {step.explanation}
        </motion.div>
      )}
    </div>
  );
}

// System Flow Animation - Shows interconnected systems
function SystemFlowAnimation({ steps, currentStep, accentColor }) {
  const step = steps[currentStep];
  const nodes = step.nodes || [];

  return (
    <div className="relative py-6">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {nodes.map((node, idx) => (
          <React.Fragment key={idx}>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: step.active === idx ? 1.1 : 1 
              }}
              transition={{ delay: idx * 0.15 }}
            >
              <div 
                className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-2 border-2 ${
                  step.active === idx ? 'shadow-lg' : ''
                }`}
                style={{ 
                  borderColor: step.active === idx ? accentColor : '#e5e5e5',
                  backgroundColor: step.active === idx ? `${accentColor}10` : 'white'
                }}
              >
                <span className="text-2xl mb-1">{node.icon || '📦'}</span>
                <span className="text-xs font-medium text-neutral-700 text-center">
                  {node.label}
                </span>
              </div>
              
              {step.active === idx && (
                <motion.div
                  className="absolute -inset-1 rounded-2xl"
                  style={{ border: `2px solid ${accentColor}` }}
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Arrow between nodes */}
            {idx < nodes.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 + 0.1 }}
              >
                <ChevronRight 
                  className="w-6 h-6"
                  style={{ color: step.active === idx ? accentColor : '#d4d4d4' }}
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      {step.explanation && (
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-neutral-600 mt-6 bg-neutral-50 rounded-lg p-3"
        >
          {step.explanation}
        </motion.p>
      )}
    </div>
  );
}

// Conceptual Transition Animation - Shows transformation of concepts
function ConceptualTransitionAnimation({ steps, currentStep, accentColor }) {
  const step = steps[currentStep];

  return (
    <div className="text-center space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 border border-neutral-200 shadow-sm"
        >
          {step.icon && (
            <span className="text-5xl block mb-4">{step.icon}</span>
          )}
          <h3 
            className="text-2xl font-bold mb-3"
            style={{ color: accentColor }}
          >
            {step.title || step.visual_state}
          </h3>
          <p className="text-neutral-600">{step.explanation}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {steps.map((_, idx) => (
          <motion.div
            key={idx}
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: idx === currentStep ? accentColor : '#e5e5e5' 
            }}
            animate={{ scale: idx === currentStep ? 1.3 : 1 }}
          />
        ))}
      </div>
    </div>
  );
}

// Main DynamicAnimation Component
function DynamicAnimation({ 
  animation, 
  title,
  accentColor = '#3b82f6',
  autoPlay = false,
  className = ''
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1500); // ms per step

  const steps = animation?.steps || [];
  const animationType = animation?.animation_type || 'process_flow';

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length, speed]);

  const handlePlayPause = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentStep, steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
    setIsPlaying(false);
  }, [steps.length]);

  if (!animation || !animation.animation_required || steps.length === 0) {
    return null;
  }

  // Render appropriate animation type
  const renderAnimation = () => {
    const props = { steps, currentStep, accentColor };

    switch (animationType) {
      case 'process_flow':
        return <ProcessFlowAnimation {...props} />;
      case 'algorithm_stepper':
        return <AlgorithmStepperAnimation {...props} />;
      case 'timeline':
        return <TimelineAnimation {...props} />;
      case 'comparison':
        return <ComparisonAnimation {...props} />;
      case 'system_flow':
        return <SystemFlowAnimation {...props} />;
      case 'conceptual_transition':
        return <ConceptualTransitionAnimation {...props} />;
      default:
        return <ProcessFlowAnimation {...props} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm ${className}`}
    >
      {/* Header */}
      <div 
        className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between"
        style={{ backgroundColor: `${accentColor}05` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Zap className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900">
              {title || animation.title || 'Interactive Animation'}
            </h4>
            <p className="text-xs text-neutral-500 capitalize">
              {animationType.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Step counter */}
        <span className="text-sm text-neutral-500">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Animation content */}
      <div className="p-6">
        {renderAnimation()}
      </div>

      {/* Controls */}
      <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors ml-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="text-xs bg-white border border-neutral-200 rounded-lg px-2 py-1.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value={2500}>Slow</option>
            <option value={1500}>Normal</option>
            <option value={800}>Fast</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}

export default DynamicAnimation;
