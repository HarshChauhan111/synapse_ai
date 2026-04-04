import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, Rewind, Shuffle } from 'lucide-react';

// Sorting algorithm implementations that yield steps
const sortingAlgorithms = {
  bubble: function* (arr) {
    const a = [...arr];
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        yield { array: [...a], comparing: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) };
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          yield { array: [...a], swapped: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) };
        }
      }
    }
    yield { array: [...a], sorted: Array.from({ length: n }, (_, i) => i) };
  },

  selection: function* (arr) {
    const a = [...arr];
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        yield { array: [...a], comparing: [minIdx, j], sorted: Array.from({ length: i }, (_, k) => k) };
        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        yield { array: [...a], swapped: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k) };
      }
    }
    yield { array: [...a], sorted: Array.from({ length: n }, (_, i) => i) };
  },

  insertion: function* (arr) {
    const a = [...arr];
    const n = a.length;
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        yield { array: [...a], comparing: [j - 1, j], sorted: [] };
        if (a[j - 1] > a[j]) {
          [a[j - 1], a[j]] = [a[j], a[j - 1]];
          yield { array: [...a], swapped: [j - 1, j], sorted: [] };
          j--;
        } else {
          break;
        }
      }
    }
    yield { array: [...a], sorted: Array.from({ length: n }, (_, i) => i) };
  },

  quick: function* (arr, left = 0, right = arr.length - 1, sortedIndices = []) {
    const a = arr;
    if (left < right) {
      // Partition
      const pivot = a[right];
      let i = left - 1;
      
      for (let j = left; j < right; j++) {
        yield { array: [...a], comparing: [j, right], pivot: right, sorted: [...sortedIndices] };
        if (a[j] < pivot) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
          yield { array: [...a], swapped: [i, j], pivot: right, sorted: [...sortedIndices] };
        }
      }
      
      [a[i + 1], a[right]] = [a[right], a[i + 1]];
      yield { array: [...a], swapped: [i + 1, right], sorted: [...sortedIndices] };
      
      const pi = i + 1;
      sortedIndices.push(pi);
      
      yield* sortingAlgorithms.quick(a, left, pi - 1, sortedIndices);
      yield* sortingAlgorithms.quick(a, pi + 1, right, sortedIndices);
    } else if (left === right) {
      sortedIndices.push(left);
    }
    
    if (left === 0 && right === arr.length - 1) {
      yield { array: [...a], sorted: Array.from({ length: a.length }, (_, i) => i) };
    }
  },

  merge: function* (arr) {
    const a = [...arr];
    const n = a.length;
    
    function* mergeSort(start, end) {
      if (end - start <= 1) return;
      
      const mid = Math.floor((start + end) / 2);
      yield* mergeSort(start, mid);
      yield* mergeSort(mid, end);
      
      // Merge
      const left = a.slice(start, mid);
      const right = a.slice(mid, end);
      let i = 0, j = 0, k = start;
      
      while (i < left.length && j < right.length) {
        yield { array: [...a], comparing: [start + i, mid + j], merging: Array.from({ length: end - start }, (_, x) => start + x) };
        if (left[i] <= right[j]) {
          a[k] = left[i];
          i++;
        } else {
          a[k] = right[j];
          j++;
        }
        yield { array: [...a], placed: [k], merging: Array.from({ length: end - start }, (_, x) => start + x) };
        k++;
      }
      
      while (i < left.length) {
        a[k] = left[i];
        yield { array: [...a], placed: [k] };
        i++;
        k++;
      }
      
      while (j < right.length) {
        a[k] = right[j];
        yield { array: [...a], placed: [k] };
        j++;
        k++;
      }
    }
    
    yield* mergeSort(0, n);
    yield { array: [...a], sorted: Array.from({ length: n }, (_, i) => i) };
  },
};

const algorithmInfo = {
  bubble: {
    name: 'Bubble Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
  },
  selection: {
    name: 'Selection Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Finds the minimum element and places it at the beginning, then repeats for the remaining elements.',
  },
  insertion: {
    name: 'Insertion Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Builds the sorted array one item at a time by inserting each element into its correct position.',
  },
  quick: {
    name: 'Quick Sort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Divides array using a pivot element, recursively sorting the partitions.',
  },
  merge: {
    name: 'Merge Sort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Divides array into halves, recursively sorts them, then merges the sorted halves.',
  },
};

function AlgorithmAnimation({ 
  algorithm = 'bubble', 
  initialArray = null, 
  title = null,
  compact = false,
  className = '' 
}) {
  const [array, setArray] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithm);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const intervalRef = useRef(null);

  // Generate random array
  const generateArray = useCallback((size = 12) => {
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
    setArray(newArray);
    setCurrentStep(null);
    setStepIndex(0);
    setIsComplete(false);
    setIsPlaying(false);
    
    // Pre-generate all steps
    const algorithmFn = sortingAlgorithms[selectedAlgorithm];
    if (algorithmFn) {
      const allSteps = [...algorithmFn([...newArray])];
      setSteps(allSteps);
    }
  }, [selectedAlgorithm]);

  // Initialize array
  useEffect(() => {
    if (initialArray && Array.isArray(initialArray)) {
      setArray(initialArray);
      const algorithmFn = sortingAlgorithms[selectedAlgorithm];
      if (algorithmFn) {
        const allSteps = [...algorithmFn([...initialArray])];
        setSteps(allSteps);
      }
    } else {
      generateArray();
    }
  }, [initialArray, selectedAlgorithm, generateArray]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && stepIndex < steps.length) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep(steps[stepIndex]);
        setStepIndex(prev => prev + 1);
      }, speed);
    } else if (stepIndex >= steps.length && steps.length > 0) {
      setIsComplete(true);
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, stepIndex, steps, speed]);

  // Update array when step changes
  useEffect(() => {
    if (currentStep) {
      setArray(currentStep.array);
    }
  }, [currentStep]);

  const handlePlayPause = () => {
    if (isComplete) {
      handleReset();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
    setCurrentStep(null);
    setIsComplete(false);
    if (initialArray) {
      setArray([...initialArray]);
    } else {
      generateArray();
    }
  };

  const handleStepForward = () => {
    if (stepIndex < steps.length) {
      setCurrentStep(steps[stepIndex]);
      setStepIndex(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (stepIndex > 1) {
      setStepIndex(prev => prev - 1);
      setCurrentStep(steps[stepIndex - 2]);
    } else if (stepIndex === 1) {
      setStepIndex(0);
      setCurrentStep(null);
      if (initialArray) {
        setArray([...initialArray]);
      }
    }
  };

  const maxValue = Math.max(...array, 100);
  const info = algorithmInfo[selectedAlgorithm];

  const getBarColor = (index) => {
    if (!currentStep) return 'bg-accent-primary/70';
    if (currentStep.sorted?.includes(index)) return 'bg-emerald-500';
    if (currentStep.swapped?.includes(index)) return 'bg-rose-500';
    if (currentStep.comparing?.includes(index)) return 'bg-amber-400';
    if (currentStep.pivot === index) return 'bg-violet-500';
    if (currentStep.placed?.includes(index)) return 'bg-cyan-400';
    if (currentStep.merging?.includes(index)) return 'bg-indigo-400/50';
    return 'bg-accent-primary/70';
  };

  return (
    <div className={`rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white/90">
            {title || info.name}
          </h3>
          {!compact && (
            <p className="text-xs text-white/50 mt-0.5">
              Time: {info.timeComplexity} • Space: {info.spaceComplexity}
            </p>
          )}
        </div>
        
        {/* Algorithm selector */}
        {!compact && (
          <select
            value={selectedAlgorithm}
            onChange={(e) => {
              setSelectedAlgorithm(e.target.value);
              setIsPlaying(false);
              setStepIndex(0);
              setCurrentStep(null);
              setIsComplete(false);
            }}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white/80 focus:outline-none focus:border-accent-primary/50"
          >
            {Object.entries(algorithmInfo).map(([key, { name }]) => (
              <option key={key} value={key} className="bg-gray-900">
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Visualization area */}
      <div className="p-4">
        <div className="flex items-end justify-center gap-1 h-32 mb-4">
          <AnimatePresence mode="popLayout">
            {array.map((value, index) => (
              <motion.div
                key={`${index}-${value}`}
                layout
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: 1, 
                  scaleY: 1,
                  transition: { duration: 0.15 }
                }}
                exit={{ opacity: 0, scaleY: 0 }}
                className={`
                  w-6 rounded-t-sm transition-colors duration-150
                  ${getBarColor(index)}
                `}
                style={{ 
                  height: `${(value / maxValue) * 100}%`,
                  minHeight: '8px'
                }}
              >
                {!compact && array.length <= 15 && (
                  <span className="text-[9px] text-white/80 block text-center mt-1 font-medium">
                    {value}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center mb-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
            <span className="text-white/50">Comparing</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-white/50">Swapping</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-white/50">Sorted</span>
          </span>
          {selectedAlgorithm === 'quick' && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-500"></span>
              <span className="text-white/50">Pivot</span>
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleStepBackward}
            disabled={stepIndex === 0}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Step Back"
          >
            <Rewind className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`
              p-3 rounded-xl transition-colors
              ${isPlaying 
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                : 'bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30'
              }
            `}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleStepForward}
            disabled={stepIndex >= steps.length}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Step Forward"
          >
            <FastForward className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => generateArray()}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="New Array"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Speed control */}
        {!compact && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[10px] text-white/40">Speed</span>
            <input
              type="range"
              min="50"
              max="800"
              value={800 - speed + 50}
              onChange={(e) => setSpeed(800 - parseInt(e.target.value) + 50)}
              className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
            <span className="text-[10px] text-white/40 w-12">
              {Math.round(1000 / speed)}x
            </span>
          </div>
        )}

        {/* Progress */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-1 flex-1 max-w-[200px] bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${steps.length > 0 ? (stepIndex / steps.length) * 100 : 0}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-[10px] text-white/40">
            {stepIndex}/{steps.length} steps
          </span>
        </div>

        {/* Completion message */}
        {isComplete && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs text-emerald-400 mt-3"
          >
            ✓ Array sorted!
          </motion.p>
        )}
      </div>

      {/* Description */}
      {!compact && (
        <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-xs text-white/50 leading-relaxed">
            {info.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default AlgorithmAnimation;
