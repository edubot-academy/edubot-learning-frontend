export const getAttendanceStatusTranslationKey = (status) =>
  status === 'not_scheduled' ? 'notScheduled' : status;

export const getAttendanceStatusLabel = (t, status, options = {}) =>
  t(`attendance.status.${getAttendanceStatusTranslationKey(status)}`, options);
