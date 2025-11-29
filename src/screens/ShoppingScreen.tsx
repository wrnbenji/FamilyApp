// src/screens/ShoppingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/common/ScreenContainer';
import { useShoppingStore } from '../store/shoppingStore';

const ShoppingScreen = () => {
  const { t } = useTranslation();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const { lists, addItem, toggleItem, removeItem, clearList } =
    useShoppingStore();

  // most egyelőre csak az első listával dolgozunk
  const currentList = lists[0];

  const handleAdd = () => {
    if (!itemName.trim() || !currentList) return;
    addItem(currentList.id, itemName.trim(), quantity.trim() || undefined);
    setItemName('');
    setQuantity('');
  };

  if (!currentList) {
    return (
      <ScreenContainer>
        <Text>Nincs bevásárlólista.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('nav.shopping')}</Text>
      <Text style={styles.listName}>{currentList.name}</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Termék..."
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Mennyiség"
          value={quantity}
          onChangeText={setQuantity}
        />
        <Button title="+" onPress={handleAdd} />
      </View>

      <View style={{ marginBottom: 8 }}>
        <Button
          title="Lista ürítése"
          onPress={() => clearList(currentList.id)}
        />
      </View>

      <FlatList
        data={currentList.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity
              onPress={() => toggleItem(currentList.id, item.id)}
            >
              <Text
                style={[styles.checkbox, item.done && styles.checkboxDone]}
              >
                {item.done ? '✓' : '○'}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={[styles.itemText, item.done && styles.itemDone]}>
                {item.name}
              </Text>
              {item.quantity ? (
                <Text style={styles.quantityText}>{item.quantity}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => removeItem(currentList.id, item.id)}
            >
              <Text style={styles.remove}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  listName: {
    fontSize: 16,
    marginBottom: 12,
    opacity: 0.7,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    fontSize: 20,
    width: 28,
  },
  checkboxDone: {
    color: 'green',
  },
  itemText: {
    fontSize: 16,
  },
  itemDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  quantityText: {
    fontSize: 12,
    opacity: 0.7,
  },
  remove: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
});

export default ShoppingScreen;