import { UserRole } from './types';

export const ROLE_INFO: Record<UserRole, { label: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    description: 'System owner with full access.'
  },
  church_admin: {
    label: 'Church Admin',
    description: 'General administrative oversight of church operations.'
  },
  ministry_leader: {
    label: 'Ministry Leader',
    description: 'Oversight and coordination of specific church ministries.'
  },
  member: {
    label: 'Member',
    description: 'Standard member access.'
  }
};
