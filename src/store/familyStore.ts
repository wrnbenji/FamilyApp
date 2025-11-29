// src/store/familyStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FamilyRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type FamilyMember = {
  id: string;
  name: string;
  role: FamilyRole;
  color?: string;
};

type FamilyState = {
  members: FamilyMember[];
  addMember: (name: string, role: FamilyRole) => void;
  removeMember: (id: string) => void;
  updateRole: (id: string, role: FamilyRole) => void;
};

export const useFamilyStore = create<FamilyState>()(
  persist<FamilyState>(
    (set) => ({
      members: [
        { id: '1', name: 'Owner', role: 'OWNER', color: '#ff6b6b' },
        { id: '2', name: 'Admin', role: 'ADMIN', color: '#1dd1a1' },
        { id: '3', name: 'User', role: 'MEMBER', color: '#54a0ff' },
      ],
      addMember: (name, role) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              id: Date.now().toString(),
              name,
              role,
            },
          ],
        })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
      updateRole: (id, role) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role } : m
          ),
        })),
    }),
    {
      name: 'familyapp-family',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);