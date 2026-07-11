import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadAttendanceFile, getAttendanceDownloadFilename } from './attendanceDownload';

describe('attendance download helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('derives filenames from export format unless one already has an extension', () => {
    expect(getAttendanceDownloadFilename('attendance', 'csv')).toBe('attendance.csv');
    expect(getAttendanceDownloadFilename('attendance', 'excel')).toBe('attendance.xlsx');
    expect(getAttendanceDownloadFilename('attendance', 'pdf')).toBe('attendance.pdf');
    expect(getAttendanceDownloadFilename('attendance.csv', 'excel')).toBe('attendance.csv');
    expect(getAttendanceDownloadFilename('attendance', 'unknown')).toBe('attendance.csv');
  });

  it('downloads a blob and revokes the object URL', () => {
    const objectUrl = 'blob:attendance-export';
    const createObjectURL = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(objectUrl);
    const revokeObjectURL = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.fn();
    const realCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const element = realCreateElement(tagName, options);
      if (tagName === 'a') {
        element.click = click;
      }
      return element;
    });

    const blob = new Blob(['student,session,status']);

    downloadAttendanceFile(blob, 'attendance', 'excel');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith(objectUrl);
    expect(document.querySelector('a[download="attendance.xlsx"]')).toBeNull();
  });
});
