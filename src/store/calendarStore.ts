import { create } from 'zustand';
import { nanoid } from 'nanoid';

// 🔹 prioritás típusok
export type EventPriority = 'low' | 'medium' | 'high';

// 🔹 naptár esemény típus
export type CalendarEvent = {
  id: string;
  title: string;
  /** Dátum formátum: 'YYYY-MM-DD' */
  date: string;
  /** Idő vagy időtartam: '08:00' vagy '08:00-09:00' */
  time?: string;
  priority: EventPriority;
};

// 🔹 store állapot
type CalendarState = {
  events: CalendarEvent[];
  addEvent: (
    title: string,
    date: string,
    time?: string,
    priority?: EventPriority
  ) => void;
  removeEvent: (id: string) => void;
  clearAll: () => void;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],

  addEvent: (
    title: string,
    date: string,
    time?: string,
    priority: EventPriority = 'medium'
  ) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          id: nanoid(),
          title,
          date,
          time,
          priority,
        },
      ],
    })),

  removeEvent: (id: string) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),

  clearAll: () => set({ events: [] }),
}));