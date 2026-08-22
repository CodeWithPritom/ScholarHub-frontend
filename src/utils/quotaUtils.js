/**
 * Unified User-Specific Quota Cycle & Rolling Refresh Calculation Utility
 * 
 * Every user has an individual rolling 7-day quota cycle anchored to:
 * 1. Their individual account registration timestamp (created_at), OR
 * 2. Their individual plan purchase / upgrade timestamp (last_reset_date).
 * 
 * Like ChatGPT / Claude, each researcher's weekly quota resets dynamically
 * on their personal 7-day rolling schedule.
 */

export function getQuotaResetInfo(lastResetDateStr, userCreatedAtStr) {
  const now = new Date();
  
  // Resolve authentic individual anchor
  let anchor = null;
  if (lastResetDateStr) {
    const d = new Date(lastResetDateStr);
    if (!isNaN(d.getTime())) anchor = d;
  }
  if (!anchor && userCreatedAtStr) {
    const d = new Date(userCreatedAtStr);
    if (!isNaN(d.getTime())) anchor = d;
  }
  if (!anchor) {
    anchor = new Date();
  }

  const CYCLE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // Jump forward in 7-day increments from the user's authentic anchor
  let nextRefresh = new Date(anchor.getTime() + CYCLE_MS);
  while (nextRefresh <= now) {
    nextRefresh = new Date(nextRefresh.getTime() + CYCLE_MS);
  }

  const diffMs = nextRefresh.getTime() - now.getTime();
  const totalHoursLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let label = `Refreshes in ${daysLeft} days`;
  let badgeText = `Refreshes in ${daysLeft}d`;

  if (totalHoursLeft <= 12) {
    label = `Refreshes in ${totalHoursLeft}h`;
    badgeText = `In ${totalHoursLeft}h`;
  } else if (totalHoursLeft <= 24 || daysLeft === 1) {
    label = 'Refreshes tomorrow';
    badgeText = 'Tomorrow';
  } else {
    label = `Refreshes in ${daysLeft} days`;
    badgeText = `${daysLeft} days left`;
  }

  return {
    nextRefreshDate: nextRefresh,
    nextRefreshIso: nextRefresh.toISOString(),
    daysLeft,
    totalHoursLeft,
    label,
    badgeText
  };
}
