/**
 * Centralized API Configuration & Fetch Wrapper
 * 
 * Single source of truth for the backend URL and authenticated API calls.
 * Uses Vite environment variable in production, falls back to localhost in dev.
 * 
 * CRITICAL: Handles 402 (Payment Required) globally by dispatching a custom
 * 'session-expired' event on window. App.jsx listens for this event and
 * immediately downgrades the global profile to 'free' + redirects to /pricing.
 * This ensures no child component can silently swallow a 402 without the
 * global state being updated.
 */

import { supabase } from '../supabaseClient';

export const PRIMARY_URL = 'https://scholarhub-backend-jjt3.onrender.com';
export const BACKUP_URL = 'https://arup-vivobook-asuslaptop-x509dj-d509dj.taila8249c.ts.net';
//export const BASE_URL = import.meta.env.VITE_API_URL || PRIMARY_URL;
export const BASE_URL = 'http://localhost:8000';

// ─── Auto-Fallback Fetch Interceptor ───
// Overrides the native window.fetch to provide seamless failover
const originalFetch = window.fetch;
window.fetch = async function(resource, config) {
  let urlStr = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : String(resource));
  
  try {
    const res = await originalFetch(resource, config);
    // If the primary server is down (502, 503, 504), throw an error to trigger the catch block fallback
    if (res && (res.status === 502 || res.status === 503 || res.status === 504)) {
      throw new Error(`Server Error: ${res.status}`);
    }
    return res;
  } catch (error) {
    // Only attempt fallback if the request was targeting our backend
    if (urlStr && (urlStr.startsWith(PRIMARY_URL) || urlStr.startsWith(BASE_URL))) {
      console.warn(`[Auto-Fallback] Connection to Primary API failed. Retrying on Backup API...`);
      
      let newUrlStr = urlStr.replace(PRIMARY_URL, BACKUP_URL);
      if (urlStr.startsWith(BASE_URL) && BASE_URL !== PRIMARY_URL) {
        newUrlStr = urlStr.replace(BASE_URL, BACKUP_URL);
      }

      let newResource = resource;
      if (typeof resource === 'string') {
        newResource = newUrlStr;
      } else if (resource instanceof Request) {
        newResource = new Request(newUrlStr, resource);
      }

      // Return the backup fetch promise, executing seamlessly
      return await originalFetch(newResource, config);
    }
    // Not a backend request or another error, throw normally
    throw error;
  }
};

/**
 * Custom event name for 402 session expiry.
 * App.jsx listens for this; any component or utility can dispatch it.
 */
export const SESSION_EXPIRED_EVENT = 'scholarhub:session-expired';

/**
 * Fires the global session-expired event.
 * Can be called from anywhere (components, fetch wrappers, interceptors).
 * App.jsx picks it up and handles global state + navigation.
 * 
 * @param {string} [detail] - Optional message to include in the expiry notification
 */
export function fireSessionExpired(detail) {
  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, {
      detail: detail || 'Your premium plan has expired. You have been reverted to the Free plan.'
    })
  );
}

/**
 * Centralized authenticated API fetch wrapper.
 * 
 * - Automatically attaches the current Supabase session token
 * - Handles 402 globally via fireSessionExpired()
 * - Returns parsed JSON on success
 * - Throws descriptive errors for all other failure codes
 * 
 * @param {string} path - API path (e.g. '/api/admin/stats')
 * @param {RequestInit} [options] - Standard fetch options (method, body, signal, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(path, options = {}) {
  // Get fresh token for every request
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  // ─── Global 402 Interception ───
  if (res.status === 402) {
    let detail = 'Your premium plan has expired.';
    try {
      const errData = await res.json();
      if (errData.detail) detail = errData.detail;
      else if (errData.error) detail = errData.error;
    } catch { /* ignore parse errors */ }

    fireSessionExpired(detail);
    throw new Error(detail);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Request failed (${res.status})`);
  }

  return res.json();
}
