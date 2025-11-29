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

// adott hónap napjait visszaadja hetekre bontva (7 oszlopos rács)
type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

const getMonthMatrix = (monthDate: Date): CalendarDay[][] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // hónap első napja
  const firstDayOfMonth = new Date(year, month, 1);
  // hét kezdete (hétfő) – 0 = vasárnap, 1 = hétfő ...
  const weekday = (firstDayOfMonth.getDay() + 6) % 7; // 0 = hétfő

  const matrix: CalendarDay[][] = [];
  let current = new Date(year, month, 1 - weekday);

  // 6 hét * 7 nap (max ennyi kell egy hónaphoz)
  for (let week = 0; week < 6; week++) {
    const row: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      row.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
      });
      current.setDate(current.getDate() + 1);
    }
    matrix.push(row);
  }

  return matrix;
};

const prettyMonth = (date: Date, locale: string) => {
  // pl. "2025. november"
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
  });
};

const CalendarScreen = () => {
  const { t, i18n } = useTranslation();
  const { events, addEvent, removeEvent } = useCalendarStore();

  const [monthDate, setMonthDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const selectedKey = formatDate(selectedDate);
  const monthMatrix = useMemo(() => getMonthMatrix(monthDate), [monthDate]);

  const eventsForDay = useMemo(
    () => events.filter((e) => e.date === selectedKey),
    [events, selectedKey]
  );

  const changeMonth = (delta: number) => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    addEvent(title.trim(), selectedKey, time.trim() || undefined);
    setTitle('');
    setTime('');
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('nav.calendar')}</Text>

      {/* Hónap fejléce */}
      <View style={styles.monthHeader}>
        <Button title="<" onPress={() => changeMonth(-1)} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.monthText}>
            {prettyMonth(monthDate, i18n.language || 'hu-HU')}
          </Text>
          <Text style={styles.todayText}>
            {t('calendar.today')} – {formatDate(today)}
          </Text>
        </View>
        <Button title=">" onPress={() => changeMonth(1)} />
      </View>

      {/* Hét napjai */}
      <View style={styles.weekDaysRow}>
        {['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'].map((d) => (
          <Text key={d} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>

      {/* Havi rács */}
      {monthMatrix.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map(({ date, isCurrentMonth }) => {
            const key = formatDate(date);
            const hasEvents = events.some((e) => e.date === key);
            const selected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.dayCell,
                  !isCurrentMonth && styles.dayCellOutside,
                  selected && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    !isCurrentMonth && styles.dayNumberOutside,
                    selected && styles.dayNumberSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {isToday && <View style={styles.todayDot} />}
                {hasEvents && <View style={styles.eventDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

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

      {/* Az adott nap eseményei */}
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
              <Text style={styles.eventDateText}>{item.date}</Text>
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
    marginBottom: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  todayText: {
    fontSize: 12,
    opacity: 0.7,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellOutside: {
    opacity: 0.4,
  },
  dayCellSelected: {
    backgroundColor: '#2563eb20',
  },
  dayNumber: {
    fontSize: 14,
  },
  dayNumberOutside: {
    opacity: 0.6,
  },
  dayNumberSelected: {
    fontWeight: '700',
    color: '#2563eb',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f97316',
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#16a34a',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  eventTitle: {
    fontSize: 16,
  },
  eventDateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  remove: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
});

export default CalendarScreen;