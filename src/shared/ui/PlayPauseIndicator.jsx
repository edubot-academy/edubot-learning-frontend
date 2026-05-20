import { useEffect, useRef, useState } from 'react';
import { BsPauseFill, BsFillPlayFill } from 'react-icons/bs';

const PlayPauseIndicator = ({ showFeedback, isPlaying, onHideFeedback }) => {
  const timeoutRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showFeedback) {
      setShouldRender(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);

      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);

        setTimeout(() => {
          setShouldRender(false);
          onHideFeedback();
        }, 300);
      }, 2700);
    } else {
      if (shouldRender) {
        setIsAnimating(false);
        setTimeout(() => {
          setShouldRender(false);
        }, 300);
      }
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [showFeedback, isPlaying, onHideFeedback, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
    >
      <div
        className={`
          bg-white/85 backdrop-blur rounded-full shadow-md p-3 sm:p-4 md:p-4
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center">
          {isPlaying ? (
            <BsPauseFill
              className={`
                text-orange-500 w-full h-full scale-110
                transition-all duration-300 ease-out
                ${isAnimating ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
              `}
            />
          ) : (
            <BsFillPlayFill
              className={`
                text-orange-500 w-full h-full scale-110 translate-x-0.5
                transition-all duration-300 ease-out
                ${isAnimating ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}
              `}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayPauseIndicator;
