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

export const PRIMARY_URL = 'https://api.scholarhub-ai.com';
export const RENDER_FALLBACK_URL = 'https://scholarhub-backend-jjt3.onrender.com';
export const BACKUP_URL = 'https://local-api.scholarhub-ai.com';
export const TAILSCALE_FALLBACK_URL = 'https://arup-vivobook-asuslaptop-x509dj-d509dj.taila8249c.ts.net';
export const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return PRIMARY_URL;
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }
  return PRIMARY_URL;
};

export const BASE_URL = typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? PRIMARY_URL
  : (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? (import.meta.env.VITE_API_URL || 'http://localhost:8000')
      : PRIMARY_URL);

// All production known backend origins for the auto-fallback interceptor
const KNOWN_PRIMARY_PREFIXES = [PRIMARY_URL, RENDER_FALLBACK_URL, BASE_URL].filter(Boolean);
const BACKUP_CANDIDATES = [BACKUP_URL, RENDER_FALLBACK_URL, TAILSCALE_FALLBACK_URL];

// ─── Auto-Fallback Fetch Interceptor ───
// Overrides the native window.fetch to provide seamless multi-tier failover
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
    // Only attempt backup fallback for production backend URLs, not localhost development
    const isLocalhost = urlStr && (urlStr.includes('localhost') || urlStr.includes('127.0.0.1'));
    const matchedPrefix = !isLocalhost && KNOWN_PRIMARY_PREFIXES.find(p => urlStr && urlStr.startsWith(p));
    
    if (matchedPrefix) {
      // Sequentially attempt backup candidates
      for (const candidateUrl of BACKUP_CANDIDATES) {
        if (candidateUrl === matchedPrefix) continue; // Skip identical
        try {
          const newUrlStr = urlStr.replace(matchedPrefix, candidateUrl);
          let newResource = resource;
          if (typeof resource === 'string') {
            newResource = newUrlStr;
          } else if (resource instanceof Request) {
            newResource = new Request(newUrlStr, resource);
          }
          const backupRes = await originalFetch(newResource, config);
          if (backupRes && backupRes.status < 500) {
            return backupRes;
          }
        } catch (backupErr) {
          // Continue to next candidate
        }
      }
    }
    // Not a backend request or all candidates exhausted, throw normally
    throw error;
  }
};

/**
 * Custom event name for 402 session expiry.
 * App.jsx listens for this; any component or utility can dispatch it.
 */
export const SESSION_EXPIRED_EVENT = 'scholarhub:session-expired';
export const DEVICE_ERROR_EVENT = 'scholarhub:device-error';

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
 * Fires the global device-error event.
 * Prompts the user to reset password to clear device conflicts.
 * 
 * @param {string} [detail] - Optional message to include in the device error notification
 */
export function fireDeviceSyncError(detail) {
  window.dispatchEvent(
    new CustomEvent(DEVICE_ERROR_EVENT, {
      detail: detail || 'Device not detected or security sync pending. Please reset your password to clear device sessions.'
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
  const deviceId = localStorage.getItem('scholarhub_device_id') || '';

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(deviceId ? { 'X-Device-ID': deviceId } : {}),
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
    const errText = err.detail || err.error || `Request failed (${res.status})`;
    if (typeof errText === 'string' && (errText.toLowerCase().includes('device') || errText.toLowerCase().includes('unregistered'))) {
      fireDeviceSyncError(errText);
    }
    throw new Error(errText);
  }

  return res.json();
}
