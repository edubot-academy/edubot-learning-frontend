export const normalizeLegacyAttendanceTableList = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.data || [];
};

export const normalizeLegacySessionAttendanceItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.rows || payload?.data || [];
};

export const cloneAttendanceData = (data = {}) =>
  Object.fromEntries(
    Object.entries(data).map(([studentId, sessionsById]) => [
      studentId,
      { ...(sessionsById || {}) },
    ])
  );

export const createAttendanceMatrixFromSessionResponses = ({
  sessions = [],
  attendanceResults = [],
  normalizeAttendanceItems = normalizeLegacySessionAttendanceItems,
} = {}) =>
  attendanceResults.reduce((matrix, sessionAttendance, index) => {
    const sessionId = sessions[index]?.id;
    const attendanceItems = normalizeAttendanceItems(sessionAttendance);

    attendanceItems.forEach((record) => {
      const studentId = record.studentId || record.userId;
      if (!studentId || !sessionId) return;

      if (!matrix[studentId]) {
        matrix[studentId] = {};
      }

      matrix[studentId][sessionId] = record.status;
    });

    return matrix;
  }, {});
