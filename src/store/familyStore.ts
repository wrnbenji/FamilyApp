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
  currentUserId: string | null;
  addMember: (name: string, role: FamilyRole) => void;
  removeMember: (id: string) => void;
  updateRole: (id: string, role: FamilyRole) => void;
  setCurrentUser: (id: string) => void;
};

export const useFamilyStore = create<FamilyState>()(
  persist<FamilyState>(
    (set) => ({
      // kezdeti minta család + aktív user az Owner
      members: [
        { id: '1', name: 'Owner', role: 'OWNER', color: '#ff6b6b' },
        { id: '2', name: 'Admin', role: 'ADMIN', color: '#1dd1a1' },
        { id: '3', name: 'User', role: 'MEMBER', color: '#54a0ff' },
      ],
      currentUserId: '1',

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
          // ha épp magunkat törölnénk, léptessük át az aktuális usert null-ra
          currentUserId:
            state.currentUserId === id ? null : state.currentUserId,
        })),

      updateRole: (id, role) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role } : m
          ),
        })),

      setCurrentUser: (id) =>
        set(() => ({
          currentUserId: id,
        })),
    }),
    {
      name: 'familyapp-family',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);