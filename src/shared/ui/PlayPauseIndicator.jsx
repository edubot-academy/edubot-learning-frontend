import React from 'react';
import { BsPauseFill, BsFillPlayFill } from 'react-icons/bs';

const PlayPauseIndicator = ({ showFeedback, isPlaying }) => {
  if (!showFeedback) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center transition-opacity duration-100"
      style={{ opacity: showFeedback ? 1 : 0 }}
    >
      <div className="bg-white/85 backdrop-blur rounded-full shadow-md p-3 sm:p-4 md:p-4" style={{ transform: showFeedback ? 'scale(1)' : 'scale(0.8)' }}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
          {isPlaying ? <BsPauseFill className="text-orange-500 w-full h-full scale-110" /> : <BsFillPlayFill className="text-orange-500 w-full h-full scale-110 translate-x-0.5" />}
        </div>
      </div>
    </div>
  );
};

export default PlayPauseIndicator;
