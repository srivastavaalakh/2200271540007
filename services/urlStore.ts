
import type { ShortenedUrl, ClickData } from '../types';
import { DEFAULT_VALIDITY_MINUTES } from '../constants';

const STORAGE_KEY = 'quantumLeapUrls';

const getUrls = (): ShortenedUrl[] => {
  try {
    const items = window.localStorage.getItem(STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return [];
  }
};

const saveUrls = (urls: ShortenedUrl[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  } catch (error) {
    console.error("Error writing to localStorage", error);
  }
};

const generateShortcode = (length: number = 6): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const addUrl = (longUrl: string, customShortcode?: string, validityMinutes?: number): Promise<ShortenedUrl> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      const urls = getUrls();
      let shortcode = customShortcode?.trim() || generateShortcode();

      if (urls.some(u => u.shortcode === shortcode)) {
        if (customShortcode) {
          return reject(new Error(`Shortcode "${shortcode}" is already taken.`));
        }
        // If generated shortcode collides, try again (highly unlikely but good practice)
        shortcode = generateShortcode();
        if (urls.some(u => u.shortcode === shortcode)) {
           return reject(new Error('Could not generate a unique shortcode. Please try again.'));
        }
      }

      const now = Date.now();
      const validity = validityMinutes === 0 ? null : (validityMinutes || DEFAULT_VALIDITY_MINUTES);
      const expiresAt = validity ? now + validity * 60 * 1000 : null;

      const newUrl: ShortenedUrl = {
        id: `url_${now}`,
        longUrl,
        shortcode,
        createdAt: now,
        expiresAt,
        clicks: [],
      };

      saveUrls([...urls, newUrl]);
      resolve(newUrl);
    }, 500);
  });
};

export const getUrlByShortcode = (shortcode: string): ShortenedUrl | undefined => {
  const urls = getUrls();
  return urls.find(u => u.shortcode === shortcode);
};

export const recordClick = (shortcode: string): void => {
  const urls = getUrls();
  const urlIndex = urls.findIndex(u => u.shortcode === shortcode);

  if (urlIndex !== -1) {
    const url = urls[urlIndex];
    if (url.expiresAt && url.expiresAt < Date.now()) {
      // Don't record clicks for expired links
      return;
    }

    const sources = ['Direct', 'Social Media', 'Search Engine', 'Email Campaign'];
    const locations = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];

    const newClick: ClickData = {
      timestamp: Date.now(),
      source: sources[Math.floor(Math.random() * sources.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
    };

    urls[urlIndex].clicks.push(newClick);
    saveUrls(urls);
  }
};

export const getAllUrls = (): ShortenedUrl[] => {
    return getUrls().sort((a, b) => b.createdAt - a.createdAt);
};
