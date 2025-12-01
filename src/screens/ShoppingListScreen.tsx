// src/screens/ShoppingListScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '../components/common/ScreenContainer';
import { useShoppingStore, ShoppingList } from '../store/shoppingStore';

type Filter = 'all' | 'active' | 'done';

const ShoppingListScreen = () => {
  const { t } = useTranslation();
  const { lists, addList, removeList, addItem, toggleItem, removeItem, clearList } =
    useShoppingStore();

  // aktív lista
  const [activeListId, setActiveListId] = useState<string>(
    lists[0]?.id ?? 'default'
  );

  const [newListName, setNewListName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const activeList: ShoppingList | undefined = useMemo(
    () => lists.find((l) => l.id === activeListId) ?? lists[0],
    [lists, activeListId]
  );

  const items = activeList?.items ?? [];

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'active':
        return items.filter((i) => !i.done);
      case 'done':
        return items.filter((i) => i.done);
      default:
        return items;
    }
  }, [items, filter]);

  const activeCount = items.filter((i) => !i.done).length;
  const doneCount = items.filter((i) => i.done).length;

  const handleAddList = () => {
    if (!newListName.trim()) return;
    addList(newListName.trim());
    setNewListName('');
  };

  const handleAddItem = () => {
    if (!activeList) return;
    if (!itemName.trim()) return;
    addItem(activeList.id, itemName.trim(), itemQty.trim() || undefined);
    setItemName('');
    setItemQty('');
  };

  const handleClearDone = () => {
    if (!activeList) return;
    if (!doneCount) return;
    // csak done elemeket töröljük – simán filterrel:
    activeList.items
      .filter((i) => i.done)
      .forEach((i) => {
        removeItem(activeList.id, i.id);
      });
  };

  const handleClearAll = () => {
    if (!activeList) return;
    clearList(activeList.id);
  };

  // weben oldalhasáb, mobilon csak a felső csippek
  const isWeb = Platform.OS === 'web';

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('shopping.title') || 'Bevásárlólista'}</Text>

      <View style={styles.rootRow}>
        {/* Web sidebar lists */}
        {isWeb && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>{t('shopping.list') || 'Listák'}</Text>

            <FlatList
              data={lists}
              keyExtractor={(l) => l.id}
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listChip,
                    item.id === activeList?.id && styles.listChipActive,
                  ]}
                  onPress={() => setActiveListId(item.id)}
                >
                  <Text
                    style={[
                      styles.listChipText,
                      item.id === activeList?.id && styles.listChipTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <View style={styles.newListBox}>
              <TextInput
                style={styles.input}
                value={newListName}
                onChangeText={setNewListName}
                placeholder={t('shopping.new') || 'Új lista neve'}
              />
              <TouchableOpacity style={styles.addListButton} onPress={handleAddList}>
                <Text style={styles.addListButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main content */}
        <View style={styles.main}>
          {/* Mobil listaváltó chippek */}
          {!isWeb && (
            <FlatList
              data={lists}
              keyExtractor={(l) => l.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listChip,
                    item.id === activeList?.id && styles.listChipActive,
                    { marginRight: 6 },
                  ]}
                  onPress={() => setActiveListId(item.id)}
                >
                  <Text
                    style={[
                      styles.listChipText,
                      item.id === activeList?.id && styles.listChipTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Aktív lista fejlec */}
          {activeList && (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{activeList.name}</Text>
              <Text style={styles.listSubTitle}>
                {activeCount} aktív • {doneCount} kész
              </Text>
            </View>
          )}

          {/* Új tétel hozzáadása */}
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder={t('shopping.new') || 'Új tétel'}
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="Mennyiség"
              value={itemQty}
              onChangeText={setItemQty}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Szűrők */}
          <View style={styles.filterRow}>
            <FilterChip
              label={t('todos.filter.all') || 'Mind'}
              active={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterChip
              label={t('todos.filter.active') || 'Aktív'}
              active={filter === 'active'}
              onPress={() => setFilter('active')}
            />
            <FilterChip
              label={t('todos.filter.done') || 'Kész'}
              active={filter === 'done'}
              onPress={() => setFilter('done')}
            />
          </View>

          {/* Lista elemek */}
          {filteredItems.length === 0 ? (
            <Text style={styles.emptyText}>
              {t('shopping.empty') || 'Nincs tétel.'}
            </Text>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.done && styles.checkboxDone,
                    ]}
                    onPress={() => activeList && toggleItem(activeList.id, item.id)}
                  >
                    {item.done && <Text style={styles.checkboxTick}>✓</Text>}
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.itemName,
                        item.done && styles.itemNameDone,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.quantity ? (
                      <Text style={styles.itemQuantity}>{item.quantity}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => activeList && removeItem(activeList.id, item.id)}
                  >
                    <Text style={styles.removeButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Akció gombok */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.footerButton, doneCount === 0 && styles.footerButtonDisabled]}
              onPress={handleClearDone}
              disabled={doneCount === 0}
            >
              <Text
                style={[
                  styles.footerButtonText,
                  doneCount === 0 && styles.footerButtonTextDisabled,
                ]}
              >
                Csak kész tételek törlése
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.footerButton,
                items.length === 0 && styles.footerButtonDisabled,
              ]}
              onPress={handleClearAll}
              disabled={items.length === 0}
            >
              <Text
                style={[
                  styles.footerButtonText,
                  items.length === 0 && styles.footerButtonTextDisabled,
                ]}
              >
                Teljes lista ürítése
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const FilterChip = ({ label, active, onPress }: ChipProps) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  rootRow: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: 220,
    marginRight: 12,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    paddingRight: 8,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  newListBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addListButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addListButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  listChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    marginBottom: 4,
  },
  listChipActive: {
    backgroundColor: '#2563eb22',
  },
  listChipText: {
    fontSize: 13,
  },
  listChipTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  main: {
    flex: 1,
  },
  listHeader: {
    marginTop: 4,
    marginBottom: 6,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listSubTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  chipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxDone: {
    backgroundColor: '#22c55e33',
    borderColor: '#22c55e',
  },
  checkboxTick: {
    fontSize: 16,
  },
  itemName: {
    fontSize: 15,
  },
  itemNameDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemQuantity: {
    fontSize: 12,
    opacity: 0.7,
  },
  removeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 16,
  },
  footerActions: {
    marginTop: 8,
    gap: 4,
  },
  footerButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
  },
  footerButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  footerButtonText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '500',
  },
  footerButtonTextDisabled: {
    color: '#9ca3af',
  },
});
export default ShoppingListScreen;