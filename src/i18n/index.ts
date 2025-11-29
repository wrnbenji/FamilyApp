// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import hu from './locales/hu.json';
import en from './locales/en.json';
import de from './locales/de.json';

const resources = {
  hu: { translation: hu },
  en: { translation: en },
  de: { translation: de },
};

const fallbackLng = 'en';

// pl. "hu-HU" -> "hu"
const deviceLocale = Localization.getLocales()[0]?.languageCode || fallbackLng;
const initialLng = deviceLocale in resources ? deviceLocale : fallbackLng;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;