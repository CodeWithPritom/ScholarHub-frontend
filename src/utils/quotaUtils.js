/**
 * Unified Quota Cycle & Refresh Calculation Utility
 * 
 * All tiers (Free: 500 Zaps/wk, Starter: 1500 Zaps/wk, Pro: 3000 Zaps/wk) 
 * follow a consistent WEEKLY (7-day) Jump-Forward Reset for Compute (Zaps) and Reference Exports.
 * 
 * Note: Subscription duration (e.g. 30 days) represents the billing plan validity,
 * while Zaps and Exports automatically reset on a 7-day rolling cycle.
 */

export function getQuotaResetInfo(lastResetDateStr) {
  const now = new Date();
  let lastReset = lastResetDateStr ? new Date(lastResetDateStr) : new Date();
  
  if (isNaN(lastReset.getTime())) {
    lastReset = new Date();
  }

  const CYCLE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  // Advance in 7-day increments until nextRefresh is strictly in the future (> now)
  let nextRefresh = new Date(lastReset.getTime() + CYCLE_MS);
  while (nextRefresh <= now) {
    nextRefresh = new Date(nextRefresh.getTime() + CYCLE_MS);
  }

  // Calculate exact day difference
  const diffMs = nextRefresh.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let label = `Refreshes in ${daysLeft} days`;
  if (daysLeft === 0) {
    label = 'Refreshing today!';
  } else if (daysLeft === 1) {
    label = 'Refreshes tomorrow';
  }

  return {
    nextRefreshDate: nextRefresh,
    nextRefreshIso: nextRefresh.toISOString(),
    daysLeft,
    label
  };
}
