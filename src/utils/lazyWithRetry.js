import { lazy } from 'react';

/**
 * Resilient Lazy Loader with Automated Cache-Busting & Chunk Reload Recovery
 * 
 * Prevents "Failed to fetch dynamically imported module" / "Strict MIME type checking" white screens
 * when users navigate after a new deployment on Vercel/Production.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('chunk_reload_recovery') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('chunk_reload_recovery', 'false');
      return component;
    } catch (error) {
      console.warn('[ChunkLoader] Stale bundle chunk detected or network glitch:', error);

      if (!pageHasAlreadyBeenForceRefreshed) {
        // Auto-refresh the page once to pull latest bundle hashes from production
        window.sessionStorage.setItem('chunk_reload_recovery', 'true');
        window.location.reload();
        return new Promise(() => {}); // Keep pending while reload happens
      }

      // If already reloaded and still failing, throw so error boundary can catch it gracefully
      throw error;
    }
  });
}

export default lazyWithRetry;
