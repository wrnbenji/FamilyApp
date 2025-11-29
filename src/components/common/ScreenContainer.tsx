// src/components/common/ScreenContainer.tsx
import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

type Props = {
  children: ReactNode;
};

const ScreenContainer = ({ children }: Props) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#f3f4f6', // világos szürke háttér
  },
});

export default ScreenContainer;