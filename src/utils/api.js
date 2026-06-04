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

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
