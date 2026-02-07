import React, { useEffect, useRef } from 'react';
import { BsPauseFill, BsFillPlayFill } from 'react-icons/bs';

const PlayPauseIndicator = ({ showFeedback, isPlaying, onHideFeedback }) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Если видео играет (показываем иконку паузы) - скрываем через 3 секунды
    if (isPlaying) {
      timeoutRef.current = setTimeout(() => {
        onHideFeedback(); // Скрываем индикатор
      }, 3000);
    } else {
      // Если видео на паузе (показываем иконку воспроизведения) - не скрываем
      clearTimeout(timeoutRef.current);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [isPlaying, onHideFeedback]);

  if (!showFeedback) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center transition-opacity duration-100"
    >
      <div className="bg-white/85 backdrop-blur rounded-full shadow-md p-3 sm:p-4 md:p-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center">
          {isPlaying ? (
            <BsPauseFill className="text-orange-500 w-full h-full scale-110" />
          ) : (
            <BsFillPlayFill className="text-orange-500 w-full h-full scale-110 translate-x-0.5" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayPauseIndicator;