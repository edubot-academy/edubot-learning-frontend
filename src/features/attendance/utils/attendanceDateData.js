export const SHORT_ATTENDANCE_DATE_FORMAT = Object.freeze({
  month: 'short',
  day: 'numeric',
});

export const SUMMARY_ATTENDANCE_DATE_FORMAT = Object.freeze({
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const formatAttendanceSessionDate = (
  value,
  {
    language,
    missingFallback = '-',
    invalidFallback = 'Unknown date',
    formatOptions = SHORT_ATTENDANCE_DATE_FORMAT,
  } = {}
) => {
  if (!value) return missingFallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return invalidFallback;

  return date.toLocaleDateString(language, formatOptions);
};
