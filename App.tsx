// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';              // i18n init
import RootTabs from './src/navigation/RootTabs';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <RootTabs />
    </NavigationContainer>
  );
}