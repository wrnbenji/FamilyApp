// src/store/todoStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
};

type TodoState = {
  todos: Todo[];
  addTodo: (title: string, priority?: Priority) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearAll: () => void;
};

export const useTodoStore = create<TodoState>()(
  persist<TodoState>(
    (set) => ({
      todos: [],
      addTodo: (title, priority = 'medium') =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: Date.now().toString(),
              title,
              priority,
              done: false,
            },
          ],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),
      clearAll: () => set({ todos: [] }),
    }),
    {
      name: 'familyapp-todos',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);