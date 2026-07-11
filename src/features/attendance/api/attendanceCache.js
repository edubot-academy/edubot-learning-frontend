import {
  getJsonStorageItem,
  getStorageKeys,
  removeStorageItem,
  setJsonStorageItem,
} from '@shared/utils/storage';

const ATTENDANCE_CACHE_PREFIX = 'attendance_cache_';

const getCacheStorageKey = (key) => `${ATTENDANCE_CACHE_PREFIX}${key}`;

export const attendanceCache = {
  generateKey: (groupId, options = {}) => {
    const keyParts = [`attendance_${groupId}`];

    if (options.startDate) keyParts.push(`start_${options.startDate}`);
    if (options.endDate) keyParts.push(`end_${options.endDate}`);
    if (options.includeUnscheduled !== undefined) {
      keyParts.push(`unsched_${options.includeUnscheduled}`);
    }

    return keyParts.join('_');
  },

  set: (key, data, ttl = 300000) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    setJsonStorageItem(getCacheStorageKey(key), item);
  },

  get: (key) => {
    const storageKey = getCacheStorageKey(key);
    const parsed = getJsonStorageItem(storageKey, null);
    if (!parsed) return null;

    if (Date.now() - parsed.timestamp > parsed.ttl) {
      removeStorageItem(storageKey);
      return null;
    }

    return parsed.data;
  },

  clear: (key) => {
    removeStorageItem(getCacheStorageKey(key));
  },

  clearAll: () => {
    getStorageKeys().forEach((key) => {
      if (key.startsWith(ATTENDANCE_CACHE_PREFIX)) {
        removeStorageItem(key);
      }
    });
  },
};
