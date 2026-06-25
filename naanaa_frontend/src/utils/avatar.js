// Shared default avatar used across the entire app.
// Update this single path if the file is renamed.
export const DEFAULT_AVATAR = '/\u2014Pngtree\u2014default avatar profile icon gray_20971753.png';

/**
 * Returns a safe image URL, falling back to DEFAULT_AVATAR when the value
 * is falsy or ends with a known placeholder name.
 * @param {string|null|undefined} url
 * @returns {string}
 */
export const safeAvatar = (url) => {
  if (!url) return DEFAULT_AVATAR;
  if (url.endsWith('gray_20971753.png')) return DEFAULT_AVATAR;
  if (url.endsWith('default.png'))       return DEFAULT_AVATAR;
  return url;
};

/**
 * onError handler – swaps a broken <img> src to DEFAULT_AVATAR.
 * Usage: <img onError={onImgError} ... />
 */
export const onImgError = (e) => {
  e.target.onerror = null; // prevent infinite loop
  e.target.src = DEFAULT_AVATAR;
};

/**
 * Resolves a Django media URL (relative/absolute) to a full HTTP URL.
 * Falls back to DEFAULT_AVATAR when the value is empty.
 * @param {string|null|undefined} url
 * @param {string} base  e.g. 'http://localhost:8000'
 * @returns {string}
 */
export const resolveMediaUrl = (url, base = 'http://localhost:8000') => {
  if (!url) return DEFAULT_AVATAR;
  if (url.endsWith('gray_20971753.png') || url.endsWith('default.png')) return DEFAULT_AVATAR;
  if (url.startsWith('http')) return url;
  return `${base}${url}`;
};
