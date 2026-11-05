import { useLab } from '../context/LabContext';

export function useLabQuota() {
  const { quota, refreshQuota } = useLab();
  const percentUsed = quota.allocated > 0
    ? Math.min(100, Math.round((quota.consumed / quota.allocated) * 100))
    : 0;

  return {
    ...quota,
    percentUsed,
    isLow: quota.available < 50000,
    refreshQuota,
  };
}
