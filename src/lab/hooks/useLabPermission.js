import { useLab } from '../context/LabContext';

export function useLabPermission() {
  const { userRole, can } = useLab();
  return {
    role: userRole,
    isPI: userRole === 'pi',
    isProfessor: userRole === 'professor' || userRole === 'pi',
    can,
  };
}
