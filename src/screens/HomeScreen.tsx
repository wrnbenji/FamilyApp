// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/common/ScreenContainer';

const dummyEvents = [
  { id: '1', title: 'Óvoda', time: '08:30' },
  { id: '2', title: 'Munkanap', time: '09:00' }
];

const dummyTodos = [
  { id: '1', title: 'Tej, kenyér, tojás', priority: 'high' },
  { id: '2', title: 'Házi feladat segítés', priority: 'urgent' }
];

const HomeScreen = () => {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 16 }}>
        {t('home.today')}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 8 }}>
        {t('home.nextEvents')}
      </Text>
      <FlatList
        data={dummyEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 4 }}>
            <Text>{item.time} – {item.title}</Text>
          </View>
        )}
        style={{ marginBottom: 16 }}
      />

      <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 8 }}>
        {t('home.importantTodos')}
      </Text>
      <FlatList
        data={dummyTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 4 }}>
            <Text>
              • {item.title} ({t(`priority.${item.priority}`)})
            </Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

export default HomeScreen;