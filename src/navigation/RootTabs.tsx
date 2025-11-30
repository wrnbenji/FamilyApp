// src/navigation/RootTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TodosScreen from '../screens/TodosScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#e5e7eb',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Todos':
              iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
              break;
            case 'Shopping':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Family':
              iconName = focused ? 'people' : 'people-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
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
        component={ShoppingListScreen}
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