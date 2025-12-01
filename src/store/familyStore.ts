// src/store/familyStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';

export type FamilyRole = 'owner' | 'admin' | 'member';

export type FamilyMember = {
  id: string;
  name: string;
  role: FamilyRole;
};

type FamilyState = {
  members: FamilyMember[];
  currentUserId: string;

  addMember: (name: string, role?: FamilyRole) => void;
  removeMember: (id: string) => void;
  setRole: (id: string, role: FamilyRole) => void;
  setCurrentUser: (id: string) => void;
};

const initialMembers: FamilyMember[] = [
  { id: 'owner-1', name: 'Owner', role: 'owner' },
  { id: 'admin-1', name: 'Admin', role: 'admin' },
  { id: 'user-1', name: 'User', role: 'member' },
];

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: initialMembers,
      currentUserId: initialMembers[0].id,

      addMember: (name, role = 'member') => {
        const trimmed = name.trim();
        if (!trimmed) return;

        set((state) => ({
          members: [
            ...state.members,
            { id: nanoid(), name: trimmed, role },
          ],
        }));
      },

      removeMember: (id) => {
        const { members, currentUserId } = get();

        const member = members.find((m) => m.id === id);
        if (!member) return;

        // ne maradjon owner nélkül a család
        if (member.role === 'owner') {
          const otherOwners = members.filter(
            (m) => m.role === 'owner' && m.id !== id
          );
          if (otherOwners.length === 0) {
            return;
          }
        }

        const newMembers = members.filter((m) => m.id !== id);

        let newCurrentUserId = currentUserId;
        if (currentUserId === id) {
          newCurrentUserId = newMembers[0]?.id ?? '';
        }

        set({
          members: newMembers,
          currentUserId: newCurrentUserId,
        });
      },

      setRole: (id, role) => {
        const { members } = get();
        const target = members.find((m) => m.id === id);
        if (!target) return;

        // owner-ről csak akkor váltsuk le, ha marad másik owner
        if (target.role === 'owner' && role !== 'owner') {
          const otherOwners = members.filter(
            (m) => m.role === 'owner' && m.id !== id
          );
          if (otherOwners.length === 0) {
            return;
          }
        }

        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role } : m
          ),
        }));
      },

      setCurrentUser: (id) => {
        const { members } = get();
        if (!members.find((m) => m.id === id)) return;
        set({ currentUserId: id });
      },
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);