// src/store/familyStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FamilyRole = 'owner' | 'admin' | 'member';

export type FamilyMember = {
  id: string;
  name: string;
  email?: string;
  role: FamilyRole;
};

type FamilyState = {
  members: FamilyMember[];
  currentUserId: string | null;

  addMember: (name: string, email?: string) => void;
  removeMember: (id: string) => void;
  setRole: (id: string, role: FamilyRole) => void;
};

export const useFamilyStore = create<FamilyState>()(
  persist<FamilyState>(
    (set, get) => ({
      // induláskor legyen egy owner (Te)
      members: [
        {
          id: 'owner-1',
          name: 'Te',
          role: 'owner',
        },
      ],
      currentUserId: 'owner-1',

      addMember: (name, email) => {
        const newMember: FamilyMember = {
          id: Date.now().toString(),
          name,
          email,
          role: 'member',
        };
        set((state) => ({
          members: [...state.members, newMember],
        }));
      },

      removeMember: (id) => {
        const state = get();
        const member = state.members.find((m) => m.id === id);
        if (!member) return;
        // ownert nem töröljük
        if (member.role === 'owner') return;

        set({
          members: state.members.filter((m) => m.id !== id),
        });
      },

      setRole: (id, role) => {
        const state = get();
        const member = state.members.find((m) => m.id === id);
        if (!member) return;
        // owner szerepet nem veszünk el, és nem adunk oda másnak
        if (member.role === 'owner' && role !== 'owner') return;
        if (role === 'owner') return;

        set({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role } : m
          ),
        });
      },
    }),
    {
      name: 'familyapp-family',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);