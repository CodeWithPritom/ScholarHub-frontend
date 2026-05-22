/**
 * Centralized API Configuration
 * Single source of truth for the backend URL.
 * Uses Vite environment variable in production, falls back to localhost in dev.
 */

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
