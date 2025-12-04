// src/store/todoStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { saveToStorage, loadFromStorage } from '../utils/storage';

export type TodoPriority = 'low' | 'medium' | 'high';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  priority: TodoPriority;
};

type TodoState = {
  todos: Todo[];
  isHydrated: boolean; // jelez, hogy betöltöttük-e már storage-ból
  addTodo: (title: string, priority?: TodoPriority) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearAll: () => void;
  setPriority: (id: string, priority: TodoPriority) => void;
  hydrate: () => Promise<void>;
};

const STORAGE_KEY = 'familyapp_todos';

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isHydrated: false,

  // 🔹 storage betöltése
  hydrate: async () => {
    if (get().isHydrated) return;
    const stored = await loadFromStorage<Todo[]>(STORAGE_KEY, []);
    set({ todos: stored, isHydrated: true });
  },

  addTodo: (title, priority = 'medium') => {
    const newTodo: Todo = {
      id: nanoid(),
      title: title.trim(),
      done: false,
      priority,
    };
    set((state) => {
      const updated = [...state.todos, newTodo];
      // mentés storage-ba
      saveToStorage(STORAGE_KEY, updated);
      return { todos: updated };
    });
  },

  toggleTodo: (id) =>
    set((state) => {
      const updated = state.todos.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      );
      saveToStorage(STORAGE_KEY, updated);
      return { todos: updated };
    }),

  deleteTodo: (id) =>
    set((state) => {
      const updated = state.todos.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEY, updated);
      return { todos: updated };
    }),

  clearAll: () =>
    set(() => {
      saveToStorage(STORAGE_KEY, []);
      return { todos: [] };
    }),

  setPriority: (id, priority) =>
    set((state) => {
      const updated = state.todos.map((t) =>
        t.id === id ? { ...t, priority } : t
      );
      saveToStorage(STORAGE_KEY, updated);
      return { todos: updated };
    }),
}));