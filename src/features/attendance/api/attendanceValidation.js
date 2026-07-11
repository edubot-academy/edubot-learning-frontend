export const OVERVIEW_ATTENDANCE_STATUSES = Object.freeze([
  'present',
  'late',
  'absent',
  'not_scheduled',
  'excused',
]);

export const isValidOverviewStatus = (status) => OVERVIEW_ATTENDANCE_STATUSES.includes(status);

export const hasValidGroupAttendanceUpdateShape = (update = {}) =>
  Boolean(update.studentId && update.sessionId && isValidOverviewStatus(update.status));

export const hasValidAdminAttendanceUpdateShape = (update = {}) =>
  Boolean(update.groupId && hasValidGroupAttendanceUpdateShape(update));

export const validateAttendanceData = (attendanceData) => {
  const errors = [];
  const warnings = [];

  if (!attendanceData.students || !Array.isArray(attendanceData.students)) {
    errors.push('Students data is required and must be an array');
  }

  if (!attendanceData.sessions || !Array.isArray(attendanceData.sessions)) {
    errors.push('Sessions data is required and must be an array');
  }

  if (!attendanceData.attendanceData || typeof attendanceData.attendanceData !== 'object') {
    errors.push('Attendance data is required and must be an object');
  }

  if (attendanceData.students) {
    attendanceData.students.forEach((student, index) => {
      if (!student.id) {
        errors.push(`Student at index ${index} is missing ID`);
      }
      if (!student.name || typeof student.name !== 'string') {
        errors.push(`Student at index ${index} is missing valid name`);
      }
    });
  }

  if (attendanceData.sessions) {
    attendanceData.sessions.forEach((session, index) => {
      if (!session.id) {
        errors.push(`Session at index ${index} is missing ID`);
      }
      if (!session.date && !session.sessionIndex) {
        warnings.push(`Session at index ${index} has no date or session index`);
      }
    });
  }

  if (attendanceData.attendanceData && attendanceData.students && attendanceData.sessions) {
    Object.keys(attendanceData.attendanceData).forEach((studentId) => {
      const studentExists = attendanceData.students.some((student) => student.id.toString() === studentId);
      if (!studentExists) {
        warnings.push(`Attendance data contains student ID ${studentId} that doesn't exist in students list`);
      }

      Object.keys(attendanceData.attendanceData[studentId]).forEach((sessionId) => {
        const sessionExists = attendanceData.sessions.some((session) => session.id.toString() === sessionId);
        if (!sessionExists) {
          warnings.push(`Attendance data contains session ID ${sessionId} that doesn't exist in sessions list`);
        }

        const status = attendanceData.attendanceData[studentId][sessionId];
        if (!isValidOverviewStatus(status)) {
          errors.push(`Invalid status "${status}" for student ${studentId}, session ${sessionId}`);
        }
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
