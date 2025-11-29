// src/store/shoppingStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ShoppingItem = {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
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

export const useShoppingStore = create<ShoppingState>()(
  persist<ShoppingState>(
    (set) => ({
      // kezdetben 1 alap lista
      lists: [
        {
          id: 'default',
          name: 'Fő lista',
          items: [],
        },
      ],
      addList: (name) =>
        set((state) => ({
          lists: [
            ...state.lists,
            { id: Date.now().toString(), name, items: [] },
          ],
        })),
      removeList: (id) =>
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
        })),
      addItem: (listId, name, quantity) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: [
                    ...list.items,
                    {
                      id: Date.now().toString(),
                      name,
                      quantity,
                      done: false,
                    },
                  ],
                }
              : list
          ),
        })),
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
                  items: list.items.filter((item) => item.id !== itemId),
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
      name: 'familyapp-shopping',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);