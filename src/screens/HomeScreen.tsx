// src/screens/HomeScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import ScreenContainer from '../components/common/ScreenContainer';
import { useTodoStore } from '../store/todoStore';
import { useShoppingStore } from '../store/shoppingStore';
import { useCalendarStore } from '../store/calendarStore';
import type { RootTabParamList } from '../navigation/RootTabs';

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

type HomeNav = BottomTabNavigationProp<RootTabParamList>;

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNav>();

  const { todos } = useTodoStore();
  const { lists } = useShoppingStore();
  const { events } = useCalendarStore();

  const todayKey = formatDate(new Date());

  const openTodosCount = useMemo(
    () => todos.filter((t) => !t.done).length,
    [todos]
  );

  const openShoppingCount = useMemo(
    () =>
      lists.reduce(
        (acc, list) =>
          acc + list.items.filter((item) => !item.done).length,
        0
      ),
    [lists]
  );

  const todayEventsCount = useMemo(
    () => events.filter((e) => e.date === todayKey).length,
    [events, todayKey]
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.greeting}>{t('home.today') || 'Heute / Today'}</Text>

        <Text style={styles.subtitle}>{t('home.nextEvents') || 'Übersicht'}</Text>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('nav.calendar')}</Text>
            <Text style={styles.cardNumber}>{todayEventsCount}</Text>
            <Text style={styles.cardHint}>{t('calendar.today')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('nav.todos')}</Text>
            <Text style={styles.cardNumber}>{openTodosCount}</Text>
            <Text style={styles.cardHint}>
              {t('home.importantTodos') || 'Offene Aufgaben'}
            </Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={styles.cardWide}>
            <Text style={styles.cardLabel}>{t('nav.shopping')}</Text>
            <Text style={styles.cardNumber}>{openShoppingCount}</Text>
            <Text style={styles.cardHint}>Még beszerzendő tétel</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gyors műveletek</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => navigation.navigate('Todos')}
          >
            <Text style={styles.quickButtonText}>+ To-do</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => navigation.navigate('Shopping')}
          >
            <Text style={styles.quickButtonText}>+ Bevásárló tétel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={styles.quickButtonText}>+ Esemény</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardWide: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardHint: {
    fontSize: 12,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  quickButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default HomeScreen;