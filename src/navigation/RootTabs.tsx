// src/navigation/RootTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TodosScreen from '../screens/TodosScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import FamilyScreen from '../screens/FamilyScreen';

export type RootTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Todos: undefined;
  Shopping: undefined;
  Family: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const RootTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('nav.home') }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: t('nav.calendar') }}
      />
      <Tab.Screen
        name="Todos"
        component={TodosScreen}
        options={{ title: t('nav.todos') }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{ title: t('nav.shopping') }}
      />
      <Tab.Screen
        name="Family"
        component={FamilyScreen}
        options={{ title: t('nav.family') }}
      />
    </Tab.Navigator>
  );
};

export default RootTabs;