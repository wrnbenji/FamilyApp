// src/store/calendarStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  time?: string; // pl. '08:30'
};

type CalendarState = {
  events: CalendarEvent[];
  addEvent: (title: string, date: string, time?: string) => void;
  removeEvent: (id: string) => void;
};

export const useCalendarStore = create<CalendarState>()(
  persist<CalendarState>(
    (set) => ({
      events: [],
      addEvent: (title, date, time) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              id: Date.now().toString(),
              title,
              date,
              time,
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