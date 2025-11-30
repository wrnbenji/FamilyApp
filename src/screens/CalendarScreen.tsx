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
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ExpoCalendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';

import ScreenContainer from '../components/common/ScreenContainer';
import {
  useCalendarStore,
  EventPriority,
  CalendarEvent,
} from '../store/calendarStore';

// helper: Date -> 'YYYY-MM-DD'
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// helper: Date -> 'HH:MM'
const formatTimeHM = (date: Date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// helper: 'HH:MM' -> Date (ma, adott idővel)
const timeStringToDate = (time?: string) => {
  const d = new Date();
  if (!time) {
    d.setHours(9, 0, 0, 0);
    return d;
  }
  const [h, m] = time.split(':').map((n) => parseInt(n, 10) || 0);
  d.setHours(h, m, 0, 0);
  return d;
};

// 15 perces léptetés weben
const clampMinutes = (total: number) => {
  if (total < 0) return 0;
  if (total > 23 * 60 + 45) return 23 * 60 + 45; // max 23:45
  return total;
};

const adjustTimeByMinutes = (
  current: string | undefined,
  delta: number,
  fallback = '08:00'
) => {
  const base = current && current.includes(':') ? current : fallback;
  const [hRaw, mRaw] = base.split(':');
  let h = parseInt(hRaw, 10) || 0;
  let m = parseInt(mRaw, 10) || 0;

  // kerekítés 15 percre
  m = Math.round(m / 15) * 15;
  let total = h * 60 + m + delta;
  total = clampMinutes(total);

  const newH = Math.floor(total / 60);
  const newM = total % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(newH)}:${pad(newM)}`;
};

// havi rács felépítése
type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

const getMonthMatrix = (monthDate: Date): CalendarDay[][] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const weekday = (firstDayOfMonth.getDay() + 6) % 7; // 0 = hétfő

  const matrix: CalendarDay[][] = [];
  let current = new Date(year, month, 1 - weekday);

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

const prettyMonth = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });

// rendszer naptár ID lekérése
async function getDefaultCalendarId(): Promise<string | null> {
  const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Naptár engedély szükséges',
      'Engedélyezd a naptár elérését a beállításoknál.'
    );
    return null;
  }

  if (Platform.OS === 'ios') {
    const defaultCal = await ExpoCalendar.getDefaultCalendarAsync();
    return defaultCal.id;
  } else {
    const calendars = await ExpoCalendar.getCalendarsAsync(
      ExpoCalendar.EntityTypes.EVENT
    );
    const primary = calendars.find((cal) => cal.isPrimary) || calendars[0];
    return primary ? primary.id : null;
  }
}

const CalendarScreen = () => {
  const { t, i18n } = useTranslation();
  const { events, addEvent, removeEvent } = useCalendarStore();

  const isWeb = Platform.OS === 'web';

  const [monthDate, setMonthDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState<string>(''); // 'HH:MM'
  const [endTime, setEndTime] = useState<string>(''); // 'HH:MM'
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [priority, setPriority] = useState<EventPriority>('medium');

  const selectedKey = formatDate(selectedDate);
  const monthMatrix = useMemo(() => getMonthMatrix(monthDate), [monthDate]);

  const eventsForDay = useMemo(
    () => events.filter((e) => e.date === selectedKey),
    [events, selectedKey]
  );

  const changeMonth = (delta: number) => {
    setMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const handleAdd = () => {
    if (!title.trim()) return;

    const start = startTime.trim();
    const end = endTime.trim();

    let timeString: string | undefined;
    if (start && end) {
      timeString = `${start}-${end}`;
    } else if (start) {
      timeString = start;
    } else {
      timeString = undefined;
    }

    addEvent(title.trim(), selectedKey, timeString, priority);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setPriority('medium');
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();

  const handleAddToDeviceCalendar = async (item: CalendarEvent) => {
    const calendarId = await getDefaultCalendarId();
    if (!calendarId) return;

    let startHour = 9;
    let startMinute = 0;
    let endHour: number | null = null;
    let endMinute: number | null = null;

    if (item.time) {
      const parts = item.time.split('-').map((p) => p.trim());
      const [startStr, endStr] = parts;

      if (startStr) {
        const [h, m] = startStr.split(':').map((n) => parseInt(n, 10) || 0);
        startHour = h;
        startMinute = m;
      }

      if (endStr) {
        const [eh, em] = endStr.split(':').map((n) => parseInt(n, 10) || 0);
        endHour = eh;
        endMinute = em;
      }
    }

    const startDate = new Date(item.date);
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(startDate);
    if (endHour !== null && endMinute !== null) {
      endDate.setHours(endHour, endMinute, 0, 0);
    } else {
      endDate.setHours(startDate.getHours() + 1);
    }

    await ExpoCalendar.createEventAsync(calendarId, {
      title: item.title,
      startDate,
      endDate,
      notes: `Created from FamilyApp (priority: ${item.priority})`,
    });

    Alert.alert('Siker', 'Esemény hozzáadva a naptárhoz.');
  };

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

      {/* Kiválasztott nap összefoglaló */}
      <View style={styles.selectedDayHeader}>
        <View>
          <Text style={styles.selectedDayLabel}>
            {t('calendar.selectedDay') || 'Kiválasztott nap'}
          </Text>
          <Text style={styles.selectedDayText}>{selectedKey}</Text>
        </View>
        <View style={styles.selectedDayCountBadge}>
          <Text style={styles.selectedDayCountText}>
            {eventsForDay.length} {t('calendar.eventsShort') || 'esemény'}
          </Text>
        </View>
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

        {/* Kezdő idő */}
        {isWeb ? (
          <View style={[styles.timeStepper, { flex: 1 }]}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() =>
                setStartTime(adjustTimeByMinutes(startTime, -15, '08:00'))
              }
            >
              <Text>-</Text>
            </TouchableOpacity>
            <View style={styles.stepperDisplay}>
              <TextInput
                style={styles.timeInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="Kezdés"
                inputMode="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() =>
                setStartTime(adjustTimeByMinutes(startTime, 15, '08:00'))
              }
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.timeButton, { flex: 1 }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {startTime || 'Kezdés'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Vég idő */}
        {isWeb ? (
          <View style={[styles.timeStepper, { flex: 1 }]}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() =>
                setEndTime(
                  adjustTimeByMinutes(
                    endTime,
                    -15,
                    startTime || '09:00'
                  )
                )
              }
            >
              <Text>-</Text>
            </TouchableOpacity>
            <View style={styles.stepperDisplay}>
              <TextInput
                style={styles.timeInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="Vége"
                inputMode="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() =>
                setEndTime(
                  adjustTimeByMinutes(endTime, 15, startTime || '09:00')
                )
              }
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.timeButton, { flex: 1 }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {endTime || 'Vége'}
            </Text>
          </TouchableOpacity>
        )}

        <Button title="+" onPress={handleAdd} />
      </View>

      {/* Time pickerek – csak mobilon, mert weben nem támogatott */}
      {!isWeb && showStartPicker && (
        <DateTimePicker
          value={timeStringToDate(startTime)}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartTime(formatTimeHM(date));
          }}
        />
      )}

      {!isWeb && showEndPicker && (
        <DateTimePicker
          value={timeStringToDate(endTime || startTime)}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndTime(formatTimeHM(date));
          }}
        />
      )}

      {/* Priority választó */}
      <View style={styles.priorityRow}>
        <TouchableOpacity
          style={[
            styles.priorityPill,
            priority === 'low' && styles.priorityPillLow,
          ]}
          onPress={() => setPriority('low')}
        >
          <Text>Kicsi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.priorityPill,
            priority === 'medium' && styles.priorityPillMedium,
          ]}
          onPress={() => setPriority('medium')}
        >
          <Text>Közepes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.priorityPill,
            priority === 'high' && styles.priorityPillHigh,
          ]}
          onPress={() => setPriority('high')}
        >
          <Text>Fontos</Text>
        </TouchableOpacity>
      </View>

      {/* Az adott nap eseményei */}
      <View style={styles.eventsCard}>
        <FlatList
          data={eventsForDay}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('calendar.noEvents')}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.eventRow}>
              <View style={styles.eventMain}>
                <Text style={styles.eventTitle}>{item.title}</Text>

                {item.time && (
                  <Text style={styles.eventTimeText}>{item.time}</Text>
                )}

                <Text style={styles.eventDateText}>{item.date}</Text>
              </View>

              <View style={styles.eventSide}>
                <View style={styles.priorityDotContainer}>
                  <View
                    style={[
                      styles.priorityDot,
                      item.priority === 'low' && { backgroundColor: '#22c55e' },
                      item.priority === 'medium' && { backgroundColor: '#eab308' },
                      item.priority === 'high' && { backgroundColor: '#ef4444' },
                    ]}
                  />
                  <Text style={styles.priorityText}>
                    {item.priority === 'high'
                      ? 'Fontos'
                      : item.priority === 'medium'
                      ? 'Közepes'
                      : 'Kicsi'}
                  </Text>
                </View>

                <View style={styles.eventActions}>
                  {/* 📅 – rendszer naptárba mentés */}
                  <TouchableOpacity
                    onPress={() => handleAddToDeviceCalendar(item)}
                    style={{ marginRight: 4 }}
                  >
                    <Text style={styles.remove}>📅</Text>
                  </TouchableOpacity>

                  {/* 🗑 – törlés az appból */}
                  <TouchableOpacity onPress={() => removeEvent(item.id)}>
                    <Text style={styles.remove}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
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
  timeButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: 14,
  },
  timeStepper: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  stepperButton: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  timeInput: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#f4f4f5',
  },
  priorityPillLow: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  priorityPillMedium: {
    backgroundColor: '#fef9c3',
    borderColor: '#eab308',
  },
  priorityPillHigh: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  eventTitle: {
    fontSize: 16,
  },
  eventDateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  priorityDotContainer: {
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  remove: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  selectedDayLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  selectedDayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDayCountBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
  },
  selectedDayCountText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  eventsCard: {
    marginTop: 4,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
  },
  eventMain: {
    flex: 1,
  },
  eventSide: {
    marginLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  eventActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  eventTimeText: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  priorityText: {
    fontSize: 11,
    marginTop: 2,
    color: '#4b5563',
  },
});

export default CalendarScreen;