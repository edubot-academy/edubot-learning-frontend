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
import { useTranslation } from 'react-i18next';

const TranscodingStatusBadge = ({
  status = 'missing',
  error = null,
  isPolling = false,
  onRetry = null,
  onForceRetry = null,
  playbackType = null,
}) => {
  const { t } = useTranslation();
  const statusConfig = {
    missing: {
      label: t('adminCourses.transcode.status.missing'),
      color: 'bg-gray-200 text-gray-800',
      icon: '⚠️',
      show: true,
    },
    uploaded: {
      label: t('adminCourses.transcode.status.uploaded'),
      color: 'bg-blue-100 text-blue-800',
      icon: '📽️',
      show: true,
    },
    starting: {
      label: playbackType === 'hls'
        ? t('adminCourses.transcode.status.stuck')
        : t('adminCourses.transcode.status.starting'),
      color: playbackType === 'hls' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800 animate-pulse',
      icon: playbackType === 'hls' ? '⚠️' : '⏳',
      show: true,
    },
    processing: {
      label: t('adminCourses.transcode.status.processing'),
      color: 'bg-yellow-100 text-yellow-800 animate-pulse',
      icon: '⚙️',
      show: true,
    },
    ready: {
      label: t('adminCourses.transcode.status.ready'),
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      show: true,
    },
    failed: {
      label: t('adminCourses.transcode.status.failed'),
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
      aria-label={
        error
          ? t('adminCourses.transcode.statusAriaWithError', {
              status: config.label,
              error,
            })
          : t('adminCourses.transcode.statusAria', { status: config.label })
      }
      title={error || config.label}
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
          aria-label={t('adminCourses.transcode.retry.aria')}
          title={t('adminCourses.transcode.retry.shortTitle')}
        >
          {t('adminCourses.transcode.retry.shortButton')}
        </button>
      )}

      {status === 'starting' && playbackType === 'hls' && onForceRetry && (
        <button
          onClick={onForceRetry}
          className="ml-2 px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          aria-label={t('adminCourses.transcode.retry.forceAria')}
          title={t('adminCourses.transcode.retry.forceTitle')}
        >
          {t('adminCourses.transcode.retry.forceButton')}
        </button>
      )}
    </div>
  );
};

export default TranscodingStatusBadge;
