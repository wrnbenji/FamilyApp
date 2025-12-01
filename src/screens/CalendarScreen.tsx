// src/screens/CalendarScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';

import ScreenContainer from '../components/common/ScreenContainer';
import {
  useCalendarStore,
  CalendarEvent,
  EventPriority,
} from '../store/calendarStore';

const CalendarScreen = () => {
  const { t } = useTranslation();
  const { events, addEvent, removeEvent } = useCalendarStore();

  // 📅 mai nap YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<EventPriority>('medium');

  // 🔹 az adott nap eseményei
  const eventsForDay = useMemo(
    () => events.filter((e) => e.date === selectedDate),
    [events, selectedDate]
  );

  // 🔹 jelölések a naptárban (pont azokon a napokon, ahol van esemény)
  const markedDates = useMemo(() => {
    const result: {
      [date: string]: { marked?: boolean; selected?: boolean; selectedColor?: string };
    } = {};

    events.forEach((e) => {
      result[e.date] = {
        ...(result[e.date] || {}),
        marked: true,
      };
    });

    result[selectedDate] = {
      ...(result[selectedDate] || {}),
      selected: true,
      selectedColor: '#2563eb',
    };

    return result;
  }, [events, selectedDate]);

  const handleAddEvent = () => {
    if (!title.trim()) {
      return;
    }
    // dátum: a kiválasztott nap
    addEvent(title.trim(), selectedDate, time.trim() || undefined, priority);
    setTitle('');
    setTime('');
  };

  const renderEventItem = ({ item }: { item: CalendarEvent }) => {
    const color =
      item.priority === 'high'
        ? '#dc2626'
        : item.priority === 'medium'
        ? '#f97316'
        : '#16a34a';

    return (
      <View style={styles.eventRow}>
        <View style={[styles.priorityDot, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventMeta}>
            {item.time || t('calendar.selectedDay') || ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => removeEvent(item.id)}
        >
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Text style={styles.screenTitle}>{t('calendar.title') || 'Kalender'}</Text>

      {/* 🗓 Felső hónapnézet naptár */}
      <View style={styles.calendarWrapper}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          firstDay={1}
          theme={{
            selectedDayBackgroundColor: '#2563eb',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#2563eb',
            arrowColor: '#2563eb',
            dotColor: '#2563eb',
            textDayFontFamily: Platform.OS === 'ios' ? undefined : 'System',
            textMonthFontFamily: Platform.OS === 'ios' ? undefined : 'System',
            textDayHeaderFontFamily:
              Platform.OS === 'ios' ? undefined : 'System',
          }}
        />
      </View>

      {/* Új esemény kártya */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('calendar.newEvent') || 'Neuer Termin'}
        </Text>

        {/* csak kijelzés, dátumot a naptárból választjuk */}
        <Text style={styles.dateLabel}>
          {t('calendar.selectedDay') || 'Ausgewähltes Datum'}:{' '}
          <Text style={styles.dateValue}>{selectedDate}</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder={t('calendar.titlePlaceholder') || 'Titel'}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder={
            t('calendar.timePlaceholder') || 'Zeit (z.B. 08:30 oder 08:30-09:30)'
          }
          value={time}
          onChangeText={setTime}
        />

        <View style={styles.priorityRow}>
          <PriorityChip
            label={t('priority.low') || 'Kicsi'}
            active={priority === 'low'}
            color="#16a34a"
            onPress={() => setPriority('low')}
          />
          <PriorityChip
            label={t('priority.medium') || 'Közepes'}
            active={priority === 'medium'}
            color="#f97316"
            onPress={() => setPriority('medium')}
          />
          <PriorityChip
            label={t('priority.high') || 'Fontos'}
            active={priority === 'high'}
            color="#dc2626"
            onPress={() => setPriority('high')}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
          <Text style={styles.addButtonText}>
            {t('calendar.addButton') || 'Hinzufügen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Az adott nap eseményei */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('calendar.eventsForDay') || 'Termine an diesem Tag'}
        </Text>

        {eventsForDay.length === 0 ? (
          <Text style={styles.emptyText}>
            {t('calendar.noEvents') || 'Keine Termine an diesem Tag.'}
          </Text>
        ) : (
          <FlatList
            data={eventsForDay}
            keyExtractor={(item) => item.id}
            renderItem={renderEventItem}
          />
        )}
      </View>
    </ScreenContainer>
  );
};

type PriorityChipProps = {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
};

const PriorityChip = ({ label, active, color, onPress }: PriorityChipProps) => (
  <TouchableOpacity
    style={[
      styles.chip,
      {
        borderColor: color,
        backgroundColor: active ? color : 'transparent',
      },
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.chipText,
        { color: active ? '#ffffff' : '#111827' },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  calendarWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  card: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 13,
    marginBottom: 4,
    color: '#6b7280',
  },
  dateValue: {
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: 8,
    columnGap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
  },
});

export default CalendarScreen;