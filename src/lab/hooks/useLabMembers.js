import { useLab } from '../context/LabContext';

export function useLabMembers() {
  const { members, refreshMembers } = useLab();

  const getMemberById = (userId) => {
    return members.find(m => m.user_id === userId) || null;
  };

  return {
    members,
    getMemberById,
    refreshMembers,
  };
}
