// src/screens/FamilyScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/common/ScreenContainer';
import i18n from '../i18n';

const FamilyScreen = () => {
  const { t } = useTranslation();

  const changeLanguage = (lng: 'hu' | 'en' | 'de') => {
    i18n.changeLanguage(lng);
  };

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
        {t('nav.family')}
      </Text>

      <Text style={{ marginBottom: 8 }}>{t('settings.language')}:</Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title={t('settings.language.hu')} onPress={() => changeLanguage('hu')} />
        <Button title={t('settings.language.en')} onPress={() => changeLanguage('en')} />
        <Button title={t('settings.language.de')} onPress={() => changeLanguage('de')} />
      </View>
    </ScreenContainer>
  );
};

export default FamilyScreen;