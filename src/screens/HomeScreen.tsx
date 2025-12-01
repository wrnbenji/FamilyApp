// src/screens/HomeScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from '../components/common/ScreenContainer';
import { useTodoStore } from '../store/todoStore';
import { useShoppingStore } from '../store/shoppingStore';
import { useCalendarStore } from '../store/calendarStore';

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { todos } = useTodoStore();
  const { lists } = useShoppingStore();
  const { events } = useCalendarStore();

  // mai dátum YYYY-MM-DD formátumban
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const todaysEvents = useMemo(
    () => events.filter((e) => e.date === todayKey),
    [events, todayKey]
  );

  const importantTodos = useMemo(
    () =>
      todos
        .filter((t) => !t.done && t.priority === 'high')
        .slice(0, 3),
    [todos]
  );

  const mainList = lists[0];
  const openShoppingItems = useMemo(
    () =>
      mainList
        ? mainList.items.filter((i) => !i.done).slice(0, 5)
        : [],
    [mainList]
  );

  const openShoppingCount = mainList
    ? mainList.items.filter((i) => !i.done).length
    : 0;

  // 🔹 Gyorsgombok navigáció
  const handleAddTodo = () => {
    navigation.navigate('Todos');      // RootTabs: name="Todos"
  };

  const handleAddShopping = () => {
    navigation.navigate('Shopping');   // RootTabs: name="Shopping"
  };

  const handleAddEvent = () => {
    navigation.navigate('Calendar');   // RootTabs: name="Calendar"
  };

  return (
    <ScreenContainer>
      {/* Felső fejléc */}
      <Text style={styles.appTitle}>{t('app.title') || 'FamilyApp'}</Text>

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.todayLabel}>{t('home.today') || 'Mai nap'}</Text>
          <Text style={styles.todayDate}>
            {today.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <FlatList
        data={[1]} // trükk: egy elem, hogy legyen scroll, de fix layout
        keyExtractor={() => 'home-content'}
        renderItem={() => (
          <>
            {/* Naptár – mai események */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {t('home.calendar') || 'Naptár'}
                </Text>
                <Text style={styles.cardSubTitle}>
                  {t('home.calendarHint') || 'Mai események'}
                </Text>
              </View>

              {todaysEvents.length === 0 ? (
                <Text style={styles.emptyText}>
                  {t('calendar.noEvents') || 'Nincs esemény ma.'}
                </Text>
              ) : (
                todaysEvents.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={styles.eventTimeDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventTime}>
                        {event.time || t('calendar.selectedDay') || ''}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Fontos teendők */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {t('home.importantTodos') || 'Fontos feladatok'}
                </Text>
              </View>

              {importantTodos.length === 0 ? (
                <Text style={styles.emptyText}>
                  {t('home.noImportantTodos') || 'Nincs fontos feladat.'}
                </Text>
              ) : (
                importantTodos.map((todo) => (
                  <View key={todo.id} style={styles.todoRow}>
                    <View style={styles.todoDot} />
                    <Text style={styles.todoText}>{todo.title}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Bevásárlólista előnézet */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {t('home.shopping') || 'Bevásárlólista'}
                </Text>
                <Text style={styles.cardSubTitle}>
                  {t('home.shoppingHint') || 'Nyitott tételek'}
                  {openShoppingCount > 0 ? ` (${openShoppingCount})` : ''}
                </Text>
              </View>

              {!mainList || mainList.items.length === 0 ? (
                <Text style={styles.emptyText}>
                  {t('home.shoppingEmpty') || 'Nincs nyitott tétel.'}
                </Text>
              ) : openShoppingItems.length === 0 ? (
                <Text style={styles.emptyText}>
                  {t('home.shoppingEmpty') || 'Nincs nyitott tétel.'}
                </Text>
              ) : (
                openShoppingItems.map((item) => (
                  <View key={item.id} style={styles.shoppingRow}>
                    <View style={styles.shoppingDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shoppingText}>{item.name}</Text>
                      {item.quantity ? (
                        <Text style={styles.shoppingQuantity}>
                          {item.quantity}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Gyors műveletek */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {t('home.quickActions') || 'Gyors műveletek'}
              </Text>
              <View style={styles.quickRow}>
                <QuickButton
                  label={t('home.addTodo') || '+ To-do'}
                  onPress={handleAddTodo}
                />
                <QuickButton
                  label={t('home.addShopping') || '+ Bevásárló tétel'}
                  onPress={handleAddShopping}
                />
                <QuickButton
                  label={t('home.addEvent') || '+ Esemény'}
                  onPress={handleAddEvent}
                />
              </View>
            </View>
          </>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </ScreenContainer>
  );
};

type QuickButtonProps = {
  label: string;
  onPress: () => void;
};

const QuickButton = ({ label, onPress }: QuickButtonProps) => (
  <TouchableOpacity style={styles.quickButton} onPress={onPress}>
    <Text style={styles.quickButtonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerRow: {
    marginBottom: 12,
  },
  todayLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  todayDate: {
    fontSize: 16,
    fontWeight: '600',
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
  cardHeader: {
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  eventTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  todoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
    marginRight: 8,
  },
  todoText: {
    fontSize: 14,
  },
  shoppingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  shoppingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 8,
  },
  shoppingText: {
    fontSize: 14,
  },
  shoppingQuantity: {
    fontSize: 12,
    opacity: 0.7,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HomeScreen;