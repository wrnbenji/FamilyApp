// src/store/calendarStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EventPriority = 'low' | 'medium' | 'high';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;        // 'YYYY-MM-DD'
  time?: string;       // pl. '08:30'
  priority: EventPriority;
  color?: string;      // később használhatjuk (pl. family member szín)
};

type CalendarState = {
  events: CalendarEvent[];
  addEvent: (
    title: string,
    date: string,
    time?: string,
    priority?: EventPriority
  ) => void;
  removeEvent: (id: string) => void;
};

export const useCalendarStore = create<CalendarState>()(
  persist<CalendarState>(
    (set) => ({
      events: [],

      addEvent: (title, date, time, priority = 'medium') =>
        set((state) => ({
          events: [
            ...state.events,
            {
              id: Date.now().toString(),
              title,
              date,
              time,
              priority,
            },
          ],
        })),

      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'familyapp-calendar',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);