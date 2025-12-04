// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  } catch (e) {
    console.warn('saveToStorage error', key, e);
  }
}

export async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const json = await AsyncStorage.getItem(key);
    if (!json) return fallback;
    return JSON.parse(json) as T;
  } catch (e) {
    console.warn('loadFromStorage error', key, e);
    return fallback;
  }
}