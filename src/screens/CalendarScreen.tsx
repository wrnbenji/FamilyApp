// src/screens/CalendarScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/common/ScreenContainer';
import { useCalendarStore } from '../store/calendarStore';

// helper: Date -> 'YYYY-MM-DD'
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// helper: szépen kiírni dátumot (pl. 2025-11-29 -> 2025.11.29.)
const prettyDate = (date: Date) => {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(date.getDate()).padStart(2, '0')}.`;
};

const CalendarScreen = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const { events, addEvent, removeEvent } = useCalendarStore();

  const currentDateKey = formatDate(currentDate);

  const eventsForDay = useMemo(
    () => events.filter((e) => e.date === currentDateKey),
    [events, currentDateKey]
  );

  const handleAdd = () => {
    if (!title.trim()) return;
    addEvent(title.trim(), currentDateKey, time.trim() || undefined);
    setTitle('');
    setTime('');
  };

  const changeDay = (delta: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    setCurrentDate(next);
  };

  const resetToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('nav.calendar')}</Text>

      {/* Dátum navigáció */}
      <View style={styles.dateRow}>
        <Button title={t('calendar.prevDay')} onPress={() => changeDay(-1)} />
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{prettyDate(currentDate)}</Text>
          <Button title={t('calendar.today')} onPress={resetToday} />
        </View>
        <Button title={t('calendar.nextDay')} onPress={() => changeDay(1)} />
      </View>

      {/* Új esemény űrlap */}
      <Text style={styles.sectionTitle}>{t('calendar.newEvent')}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder={t('calendar.title') || 'Title'}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={t('calendar.time') || 'Time'}
          value={time}
          onChangeText={setTime}
        />
        <Button title="+" onPress={handleAdd} />
      </View>

      {/* Napi esemény lista */}
      <FlatList
        data={eventsForDay}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('calendar.noEvents')}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {item.time ? `${item.time} – ${item.title}` : item.title}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removeEvent(item.id)}>
              <Text style={styles.remove}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  eventTitle: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  remove: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
});

export default CalendarScreen;