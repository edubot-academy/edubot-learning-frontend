const buildAttendanceParams = (options = {}, defaults = {}) => ({
  ...defaults,
  ...(options.groupIds && { groupIds: options.groupIds.join(',') }),
  ...(options.startDate && { startDate: options.startDate }),
  ...(options.endDate && { endDate: options.endDate }),
  ...(options.sessionIds && { sessionIds: options.sessionIds.join(',') }),
  ...(options.studentIds && { studentIds: options.studentIds.join(',') }),
});

const omitParams = (params, keys) =>
  Object.fromEntries(Object.entries(params).filter(([key]) => !keys.includes(key)));

export const getGroupOverviewParams = (options = {}) =>
  omitParams(
    buildAttendanceParams(options, {
      includeUnscheduled: options.includeUnscheduled !== false ? 'true' : 'false',
      includeStats: options.includeStats !== false ? 'true' : 'false',
    }),
    ['groupIds', 'studentIds']
  );

export const getAdminOverviewParams = (options = {}) =>
  omitParams(
    buildAttendanceParams(options, {
      includeUnscheduled: options.includeUnscheduled !== false ? 'true' : 'false',
      includeStats: options.includeStats !== false ? 'true' : 'false',
    }),
    ['studentIds']
  );

export const getGroupStatisticsParams = (options = {}) =>
  omitParams(
    buildAttendanceParams(options, {
      ...(options.includeTrends && { includeTrends: 'true' }),
      ...(options.includeComparison && { includeComparison: 'true' }),
    }),
    ['groupIds', 'sessionIds', 'studentIds']
  );

export const getAdminStatisticsParams = (options = {}) =>
  omitParams(
    buildAttendanceParams(options, {
      ...(options.includeTrends && { includeTrends: 'true' }),
      ...(options.includeComparison && { includeComparison: 'true' }),
    }),
    ['sessionIds', 'studentIds']
  );

const getExportParams = (options = {}) =>
  buildAttendanceParams(options, {
    format: options.format || 'csv',
    includeUnscheduled: options.includeUnscheduled !== false ? 'true' : 'false',
  });

export const getGroupExportParams = (options = {}) =>
  omitParams(getExportParams(options), ['groupIds']);

export const getAdminExportParams = getExportParams;

export const getStudentHistoryParams = (options = {}) => ({
  ...(options.groupId && { groupId: options.groupId }),
  ...(options.startDate && { startDate: options.startDate }),
  ...(options.endDate && { endDate: options.endDate }),
  ...(options.includeDetails && { includeDetails: 'true' }),
});

export const getAttendanceTrendParams = (options = {}) => ({
  ...(options.startDate && { startDate: options.startDate }),
  ...(options.endDate && { endDate: options.endDate }),
  ...(options.period && { period: options.period }),
  ...(options.includeComparison && { includeComparison: 'true' }),
});
