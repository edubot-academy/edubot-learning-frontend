/**
 * TranscodingStatusBadge - Visual indicator for lesson video transcoding status
 * 
 * Shows different UI based on playback status:
 * - missing: No video uploaded
 * - uploaded: Video ready but not transcoded yet
 * - starting: Transcode job about to start
 * - processing: Actively transcoding
 * - ready: Video ready to play
 * - failed: Transcode failed with error message
 */
const TranscodingStatusBadge = ({
  status = 'missing',
  error = null,
  isPolling = false,
  onRetry = null,
  onForceRetry = null,
  playbackType = null,
}) => {
  const statusConfig = {
    missing: {
      label: 'No Video',
      color: 'bg-gray-200 text-gray-800',
      icon: '⚠️',
      show: true,
    },
    uploaded: {
      label: 'Ready to Transcode',
      color: 'bg-blue-100 text-blue-800',
      icon: '📽️',
      show: true,
    },
    starting: {
      label: playbackType === 'hls' ? 'Stuck - Force Retry Needed' : 'Starting Transcode...',
      color: playbackType === 'hls' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800 animate-pulse',
      icon: playbackType === 'hls' ? '⚠️' : '⏳',
      show: true,
    },
    processing: {
      label: 'Transcoding in Progress',
      color: 'bg-yellow-100 text-yellow-800 animate-pulse',
      icon: '⚙️',
      show: true,
    },
    ready: {
      label: 'Ready to Play',
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      show: true,
    },
    failed: {
      label: 'Transcode Failed',
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      show: true,
    },
  };

  const config = statusConfig[status] || statusConfig.missing;

  if (!config.show) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${config.color}`}
      role="status"
      aria-live="polite"
      aria-label={`Video transcoding status: ${config.label}`}
    >
      <span className="text-base" aria-hidden="true">{config.icon}</span>
      <span className="font-medium text-sm">{config.label}</span>

      {isPolling && status === 'processing' && (
        <span className="ml-1 inline-block w-2 h-2 bg-current rounded-full animate-bounce" aria-hidden="true"></span>
      )}

      {status === 'failed' && onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          aria-label="Retry video transcoding"
          title="Retry transcoding"
        >
          Retry
        </button>
      )}

      {status === 'starting' && playbackType === 'hls' && onForceRetry && (
        <button
          onClick={onForceRetry}
          className="ml-2 px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          aria-label="Force retry stuck transcoding"
          title="Force restart stuck transcoding"
        >
          Force Retry
        </button>
      )}
    </div>
  );
};

export default TranscodingStatusBadge;
