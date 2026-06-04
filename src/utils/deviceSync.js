/**
 * deviceSync.js — Silent Background Device Synchronization
 * 
 * Ensures every authenticated user has a registered device entry in `user_devices`.
 * Solves the gap where users logging in via Supabase Email Confirmation links
 * bypass the Auth.jsx device registration flow, causing AI features to fail
 * with "Unregistered device" errors.
 * 
 * This module is designed to be called from App.jsx's onAuthStateChange listener
 * and runs silently in the background without interrupting the user experience.
 */

import { supabase } from '../supabaseClient';

/** localStorage key for device ID — must match Auth.jsx and ResearchPage.jsx */
const DEVICE_ID_KEY = 'scholarhub_device_id';

/** Prevent concurrent sync attempts */
let _syncInProgress = false;

/**
 * Gets or generates a stable device ID from localStorage.
 * @returns {string} The device ID (UUID v4)
 */
export function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Derives a human-readable device name from the User-Agent string.
 * Mirrors the logic in Auth.jsx for consistency.
 * @returns {string} Device name label
 */
function getDeviceName() {
  const ua = window.navigator.userAgent;
  if (ua.includes('Mobi') || ua.includes('Android')) return 'Mobile Device';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac')) return 'Mac';
  if (ua.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

/**
 * Ensures the current device is registered in `user_devices` for the given user.
 * 
 * Flow:
 *   1. Get/create deviceId from localStorage
 *   2. Query user_devices for this userId + deviceId
 *   3. If NOT registered:
 *      a. Check total device count for this user
 *      b. If count < 2 → silently insert the device
 *      c. If count >= 2 → show a non-blocking warning (console + optional callback)
 * 
 * This function is idempotent and safe to call multiple times.
 * 
 * @param {string} userId - The authenticated user's UUID
 * @param {function} [onDeviceLimitReached] - Optional callback when device limit is hit
 * @returns {Promise<{synced: boolean, deviceId: string, limitReached?: boolean}>}
 */
export async function ensureDeviceIsRegistered(userId, onDeviceLimitReached) {
  if (!userId) return { synced: false, deviceId: null };

  // Prevent re-entrant calls (e.g., rapid auth state changes)
  if (_syncInProgress) return { synced: false, deviceId: getOrCreateDeviceId() };
  _syncInProgress = true;

  const deviceId = getOrCreateDeviceId();

  try {
    // Step 1: Check if this exact device is already registered
    const { data: existingDevice, error: checkError } = await supabase
      .from('user_devices')
      .select('device_id')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .maybeSingle();

    if (checkError) {
      console.warn('[DeviceSync] Error checking device registration:', checkError.message);
      return { synced: false, deviceId };
    }

    // Already registered — nothing to do
    if (existingDevice) {
      return { synced: true, deviceId };
    }

    // Step 2: Device not registered — check total count for this user
    const { data: allDevices, error: countError } = await supabase
      .from('user_devices')
      .select('device_id')
      .eq('user_id', userId);

    if (countError) {
      console.warn('[DeviceSync] Error counting user devices:', countError.message);
      return { synced: false, deviceId };
    }

    const deviceCount = allDevices?.length || 0;

    // Step 3a: Under the limit — register this device silently
    if (deviceCount < 2) {
      const { error: insertError } = await supabase
        .from('user_devices')
        .insert({
          user_id: userId,
          device_id: deviceId,
          device_name: getDeviceName()
        });

      if (insertError) {
        // Handle potential race condition (duplicate insert)
        if (insertError.code === '23505') {
          // Unique constraint violation — already inserted by another tab/call
          return { synced: true, deviceId };
        }
        console.warn('[DeviceSync] Error registering device:', insertError.message);
        return { synced: false, deviceId };
      }

      console.log('[DeviceSync] ✓ Device registered silently:', deviceId.substring(0, 8) + '...');
      return { synced: true, deviceId };
    }

    // Step 3b: Limit reached — notify but don't block
    console.warn('[DeviceSync] Device limit reached (2/2). New device not registered.');
    if (typeof onDeviceLimitReached === 'function') {
      onDeviceLimitReached();
    }
    return { synced: false, deviceId, limitReached: true };

  } catch (err) {
    console.error('[DeviceSync] Unexpected error during device sync:', err);
    return { synced: false, deviceId };
  } finally {
    _syncInProgress = false;
  }
}
