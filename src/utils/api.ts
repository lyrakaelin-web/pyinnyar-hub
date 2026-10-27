import { Capacitor } from '@capacitor/core';

/**
 * Production backend API URL for PYINNYAR HUB.
 */
export const PRODUCTION_API_URL = 'https://pyinnyar-hub.onrender.com';

/**
 * Universal backend API URL resolver.
 * Handles both web browser relative endpoints and Capacitor mobile native runtime (iOS / Android),
 * ensuring the mobile application securely connects to the existing production backend without hardcoded preview URLs.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (Capacitor.isNativePlatform()) {
    // Exact production backend URL for native Android & iOS mobile WebView requests
    return PRODUCTION_API_URL;
  }
  // Browser environments (local development & hosted web app) use relative paths (/api/...)
  return '';
};

/**
 * Constructs a fully qualified API URL.
 * Automatically normalizes leading slashes and prevents double-slash or missing path issues.
 */
export const apiUrl = (endpoint: string): string => {
  let cleanEndpoint = (endpoint || '').trim();
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }
  const base = getApiBaseUrl();
  return `${base}${cleanEndpoint}`;
};
