// src/store/shoppingStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';

export type ShoppingItem = {
  id: string;
  name: string;
  quantity?: string;
  done: boolean;
};

export type ShoppingList = {
  id: string;
  name: string;
  items: ShoppingItem[];
};

type ShoppingState = {
  lists: ShoppingList[];
  addList: (name: string) => void;
  removeList: (id: string) => void;
  addItem: (listId: string, name: string, quantity?: string) => void;
  toggleItem: (listId: string, itemId: string) => void;
  removeItem: (listId: string, itemId: string) => void;
  clearList: (listId: string) => void;
};

const createDefaultList = (): ShoppingList => ({
  id: 'default',
  name: 'Alap lista',
  items: [],
});

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      lists: [createDefaultList()],

      addList: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const newList: ShoppingList = {
          id: nanoid(),
          name: trimmed,
          items: [],
        };

        set((state) => ({
          lists: [...state.lists, newList],
        }));
      },

      removeList: (id) => {
        if (id === 'default') return;

        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
        }));
      },

      addItem: (listId, name, quantity) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: [
                    ...list.items,
                    {
                      id: nanoid(),
                      name: trimmed,
                      quantity: quantity?.trim() || undefined,
                      done: false,
                    },
                  ],
                }
              : list
          ),
        }));
      },

      toggleItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId
                      ? { ...item, done: !item.done }
                      : item
                  ),
                }
              : list
          ),
        })),

      removeItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.filter((i) => i.id !== itemId),
                }
              : list
          ),
        })),

      clearList: (listId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId ? { ...list, items: [] } : list
          ),
        })),
    }),
    {
      name: 'shopping-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);