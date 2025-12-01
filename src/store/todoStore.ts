import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;     // <- FONTOS: a projekted mindenhol title-t használ
  priority: TodoPriority;
  done: boolean;
  createdAt: string;
}

interface TodoState {
  todos: Todo[];
  addTodo: (title: string, priority: TodoPriority) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],

      addTodo: (title, priority) =>
        set((state) => ({
          todos: [
            {
              id: nanoid(),
              title,
              priority,
              done: false,
              createdAt: new Date().toISOString(),
            },
            ...state.todos,
          ],
        })),

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),

      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((t) => !t.done),
        })),

      clearAll: () =>
        set(() => ({
          todos: [],
        })),
    }),
    {
      name: 'todo-store',
    }
  )
);