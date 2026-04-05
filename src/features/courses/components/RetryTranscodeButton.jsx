/**
 * RetryTranscodeButton - Button to retry failed transcode operations
 * 
 * Shows only when playback status is 'failed' and requires onClick handler.
 * Handles loading state and error feedback to user.
 */
import { useState } from 'react';

const RetryTranscodeButton = ({
  courseId,
  sectionId,
  lessonId,
  retryFn,
  onError = null,
  onSuccess = null,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [retryError, setRetryError] = useState(null);

  const handleRetry = async () => {
    try {
      setIsLoading(true);
      setRetryError(null);

      // Validate required IDs
      if (!courseId || !sectionId || !lessonId) {
        throw new Error('Missing course, section, or lesson ID required for retry');
      }

      if (!retryFn) {
        throw new Error('Retry function not provided');
      }

      // Call the retry function with course context
      await retryFn(courseId, sectionId, lessonId);

      // Success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error?.message || 'Failed to retry transcoding. Please try again.';
      setRetryError(errorMessage);
      
      if (onError) {
        onError(error);
      }

      console.error('[RetryTranscodeButton] Retry failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRetry}
        disabled={isLoading}
        className={`
          px-4 py-2 bg-red-600 text-white font-medium rounded-md
          hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        title="Retry the video transcoding process"
      >
        {isLoading ? (
          <>
            <span className="inline-block mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Retrying...
          </>
        ) : (
          <>🔄 Retry Transcoding</>
        )}
      </button>

      {retryError && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {retryError}
        </div>
      )}
    </div>
  );
};

export default RetryTranscodeButton;
