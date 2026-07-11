const EXPORT_FILE_EXTENSIONS = Object.freeze({
  csv: 'csv',
  excel: 'xlsx',
  pdf: 'pdf',
});

export const getAttendanceDownloadFilename = (filename, format = 'csv') => {
  const extension = EXPORT_FILE_EXTENSIONS[format] || EXPORT_FILE_EXTENSIONS.csv;
  return filename.includes('.') ? filename : `${filename}.${extension}`;
};

export const downloadAttendanceFile = (blobData, filename, format = 'csv') => {
  const fullFilename = getAttendanceDownloadFilename(filename, format);
  const url = window.URL.createObjectURL(blobData);
  const link = document.createElement('a');

  link.href = url;
  link.download = fullFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
