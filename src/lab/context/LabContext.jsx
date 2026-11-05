/**
 * Lab Context Provider
 * Maintains persistent multi-tenant workspace state, quota telemetry, and permissions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { labApi } from '../utils/labApi';
import { canUser } from '../utils/labPermissions';
import { toast } from 'sonner';

const LabContext = createContext(null);

export function LabProvider({ children, user }) {
  const { labId } = useParams();
  const navigate = useNavigate();

  const [currentLab, setCurrentLab] = useState(null);
  const [userRole, setUserRole] = useState('observer');
  const [customCapabilities, setCustomCapabilities] = useState([]);
  const [deniedCapabilities, setDeniedCapabilities] = useState([]);
  const [quota, setQuota] = useState({ allocated: 0, consumed: 0, reserved: 0, available: 0 });
  const [members, setMembers] = useState([]);
  const [userLabs, setUserLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch labs the user belongs to
  const refreshUserLabs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await labApi.getUserLabs(user.id);
      if (res.success) {
        setUserLabs(res.labs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch user labs:', e);
    }
  }, [user?.id]);

  // Fetch current lab details, membership, and quota
  const refreshCurrentLab = useCallback(async () => {
    if (!labId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Lab Detail
      const labRes = await labApi.getLab(labId);
      if (labRes.success) {
        setCurrentLab(labRes.lab);
      }

      // 2. Fetch Members & Current User's Role
      const memRes = await labApi.listMembers(labId);
      if (memRes.success) {
        setMembers(memRes.members || []);
        const myMembership = (memRes.members || []).find(m => m.user_id === user?.id);
        if (myMembership) {
          setUserRole(myMembership.role || 'observer');
          setCustomCapabilities(myMembership.custom_capabilities || []);
          setDeniedCapabilities(myMembership.denied_capabilities || []);
        } else if (labRes.lab?.owner_user_id === user?.id || user?.email === 'pritombhowmik360@gmail.com' || user?.email === 'arupbhowmikpritom@gmail.com') {
          // Lab Owner / Platform Admin
          setUserRole('pi');
        } else {
          // Default guest / observer
          setUserRole('observer');
        }
      }

      // 3. Fetch Quota Telemetry
      const quotaRes = await labApi.getQuota(labId);
      if (quotaRes.success) {
        setQuota(quotaRes.quota);
      }
    } catch (err) {
      console.error('Error initializing Lab workspace:', err);
      setError(err.message || 'Failed to load Lab workspace');
    } finally {
      setLoading(false);
    }
  }, [labId, user?.id]);

  const refreshQuota = useCallback(async () => {
    if (!labId) return;
    try {
      const res = await labApi.getQuota(labId);
      if (res.success) {
        setQuota(res.quota);
      }
    } catch (e) {
      console.warn('Failed to refresh quota:', e);
    }
  }, [labId]);

  useEffect(() => {
    refreshUserLabs();
  }, [refreshUserLabs]);

  useEffect(() => {
    refreshCurrentLab();
  }, [refreshCurrentLab]);

  // Capability Checker Helper
  const can = useCallback((capability, projectRole = null, projectCustomCaps = []) => {
    return canUser(
      userRole,
      customCapabilities,
      deniedCapabilities,
      capability,
      projectRole,
      projectCustomCaps
    );
  }, [userRole, customCapabilities, deniedCapabilities]);

  const value = {
    currentLab,
    setCurrentLab,
    userRole,
    customCapabilities,
    deniedCapabilities,
    can,
    quota,
    refreshQuota,
    members,
    refreshMembers: refreshCurrentLab,
    userLabs,
    refreshUserLabs,
    loading,
    error,
    refreshCurrentLab
  };

  return (
    <LabContext.Provider value={value}>
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return ctx;
}
