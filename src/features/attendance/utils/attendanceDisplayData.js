export const getAttendanceSessionTitle = (
  t,
  session = {},
  { fallbackId = session?.sessionIndex || session?.id } = {}
) => {
  if (session?.title) return session.title;

  return t('attendance.fallbacks.sessionWithId', { id: fallbackId });
};

export const getAttendanceStudentInitials = (name, fallbackName = '') =>
  (name || fallbackName)
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
