import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * TextSelectionPopup - Shows "Ask Synapse" button when text is selected
 */
function TextSelectionPopup({ onAskSynapse, containerRef }) {
  const [selection, setSelection] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseUp = useCallback(() => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selectedText = window.getSelection()?.toString().trim();
      
      if (selectedText && selectedText.length > 3) {
        const selectionObj = window.getSelection();
        if (selectionObj && selectionObj.rangeCount > 0) {
          const range = selectionObj.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          // Check if selection is within our container
          if (containerRef?.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const isWithinContainer = 
              rect.top >= containerRect.top &&
              rect.bottom <= containerRect.bottom + 100;
            
            if (!isWithinContainer) {
              setSelection(null);
              return;
            }
          }
          
          // Position popup above the selection
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          setSelection(selectedText);
        }
      } else {
        setSelection(null);
      }
    }, 10);
  }, [containerRef]);

  const handleMouseDown = useCallback(() => {
    // Clear selection when starting a new selection
    setSelection(null);
  }, []);

  const handleClick = useCallback(() => {
    if (selection) {
      onAskSynapse(selection);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [selection, onAskSynapse]);

  // Handle scroll - hide popup
  const handleScroll = useCallback(() => {
    setSelection(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleMouseUp, handleMouseDown, handleScroll]);

  return (
    <AnimatePresence>
      {selection && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
        >
          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2] text-white font-medium text-sm shadow-lg shadow-sky-500/25 border border-sky-400/20 hover:bg-[#1a91da] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Synapse</span>
          </motion.button>
          
          {/* Arrow pointer */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #1DA1F2',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TextSelectionPopup;
