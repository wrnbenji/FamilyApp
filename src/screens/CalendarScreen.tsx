import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '../components/common/ScreenContainer';
import {
  useCalendarStore,
  CalendarEvent,
  EventPriority,
} from '../store/calendarStore';

const CalendarScreen = () => {
  const { t } = useTranslation();
  const { events, addEvent, removeEvent } = useCalendarStore();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // 'YYYY-MM-DD'
  const [time, setTime] = useState(''); // 'HH:MM' vagy 'HH:MM-HH:MM'
  const [priority, setPriority] = useState<EventPriority>('medium');

  const handleAddEvent = () => {
    if (!title.trim() || !date.trim()) {
      return;
    }
    addEvent(title.trim(), date.trim(), time.trim() || undefined, priority);
    setTitle('');
    setTime('');
  };

  const renderItem = ({ item }: { item: CalendarEvent }) => {
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
            {item.date}
            {item.time ? ` • ${item.time}` : ''}
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('calendar.newEvent') || 'Neuer Termin'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={t('calendar.titlePlaceholder') || 'Titel'}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder={t('calendar.datePlaceholder') || 'Datum (YYYY-MM-DD)'}
          value={date}
          onChangeText={setDate}
        />

        <TextInput
          style={styles.input}
          placeholder={t('calendar.timePlaceholder') || 'Zeit (z.B. 08:30 oder 08:30-09:30)'}
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('calendar.eventsForDay') || 'Termine'}
        </Text>

        {events.length === 0 ? (
          <Text style={styles.emptyText}>
            {t('calendar.noEvents') || 'Keine Termine.'}
          </Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
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
  card: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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