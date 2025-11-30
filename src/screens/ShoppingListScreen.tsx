// src/screens/ShoppingListScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '../components/common/ScreenContainer';
import { useShoppingStore } from '../store/shoppingStore';

type Filter = 'all' | 'open' | 'done';

const ShoppingListScreen = () => {
  const { t } = useTranslation();
  const { lists, addList, removeList, addItem, toggleItem, removeItem, clearList } =
    useShoppingStore();

  const isWeb = Platform.OS === 'web';

  const [activeListId, setActiveListId] = useState<string>('default');
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [newListName, setNewListName] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const activeList = useMemo(() => {
    if (!lists.length) return undefined;
    const found = lists.find((l) => l.id === activeListId);
    return found ?? lists[0];
  }, [lists, activeListId]);

  const handleAddItem = () => {
    if (!activeList) return;
    if (!itemName.trim()) return;
    addItem(activeList.id, itemName.trim(), itemQuantity.trim() || undefined);
    setItemName('');
    setItemQuantity('');
  };

  const handleAddList = () => {
    if (!newListName.trim()) return;
    addList(newListName.trim());
    setNewListName('');
  };

  const handleRemoveList = (id: string) => {
    // ne engedd törölni az alap 'default' listát
    if (id === 'default') return;
    removeList(id);
    if (activeListId === id) {
      // ha az aktívat töröltük, álljunk át az elsőre, ha van
      if (lists.length > 1) {
        const next = lists.find((l) => l.id !== id);
        if (next) setActiveListId(next.id);
      } else {
        setActiveListId('default');
      }
    }
  };

  const filteredItems = useMemo(() => {
    if (!activeList) return [];
    return activeList.items.filter((item) => {
      if (filter === 'open') return !item.done;
      if (filter === 'done') return item.done;
      return true;
    });
  }, [activeList, filter]);

  const activeListName = activeList?.name ?? 'Lista';

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('nav.shopping') || 'Bevásárlólista'}</Text>

      <View style={isWeb ? styles.webLayout : styles.mobileLayout}>
        {/* LISTA-VÁLASZTÓ – bal oldal weben, felül mobilon */}
        <View style={isWeb ? styles.listsSidebar : styles.listsTopBar}>
          <Text style={styles.listsHeader}>Listák</Text>

          {isWeb ? (
            // web: oszlopban a listák
            <FlatList
              data={lists}
              keyExtractor={(l) => l.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setActiveListId(item.id)}
                  style={[
                    styles.listRow,
                    activeList?.id === item.id && styles.listRowActive,
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        styles.listName,
                        activeList?.id === item.id && styles.listNameActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.listSub}>
                      {item.items.length} tétel
                    </Text>
                  </View>
                  {item.id !== 'default' && (
                    <TouchableOpacity
                      onPress={() => handleRemoveList(item.id)}
                    >
                      <Text style={styles.listRemove}>🗑</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
          ) : (
            // mobil: vízszintes pillek
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listsPillsRow}
            >
              {lists.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setActiveListId(item.id)}
                  style={[
                    styles.listPill,
                    activeList?.id === item.id && styles.listPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.listPillText,
                      activeList?.id === item.id && styles.listPillTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Új lista hozzáadása */}
          <View style={styles.newListBox}>
            <TextInput
              style={styles.input}
              placeholder="Új lista neve..."
              value={newListName}
              onChangeText={setNewListName}
            />
            <Button title="Új lista" onPress={handleAddList} />
          </View>
        </View>

        {/* AKTÍV LISTA TARTALMA – jobb oldal weben, alatta mobilon */}
        <View style={styles.itemsContainer}>
          <Text style={styles.activeListTitle}>{activeListName}</Text>

          {/* Új tétel hozzáadása */}
          <View style={styles.itemInputRow}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder="Mit vegyünk?"
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Mennyiség"
              value={itemQuantity}
              onChangeText={setItemQuantity}
            />
            <Button title="+" onPress={handleAddItem} />
          </View>

          {/* Szűrők */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                filter === 'all' && styles.filterPillActive,
              ]}
              onPress={() => setFilter('all')}
            >
              <Text>Mind</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterPill,
                filter === 'open' && styles.filterPillActive,
              ]}
              onPress={() => setFilter('open')}
            >
              <Text>Nyitott</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterPill,
                filter === 'done' && styles.filterPillActive,
              ]}
              onPress={() => setFilter('done')}
            >
              <Text>Megvett</Text>
            </TouchableOpacity>
          </View>

          {/* Lista műveletek */}
          <View style={styles.actionsRow}>
            <Button
              title="Lista ürítése"
              onPress={() => activeList && clearList(activeList.id)}
            />
          </View>

          {/* TÉTELEK LISTÁJA */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {filter === 'done'
                  ? 'Még semmi sincs megvéve.'
                  : 'Még nincs tétel ebben a listában.'}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => activeList && toggleItem(activeList.id, item.id)}
                >
                  <Text
                    style={[
                      styles.checkbox,
                      item.done && styles.checkboxDone,
                    ]}
                  >
                    {item.done ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.itemTitle,
                      item.done && styles.itemTitleDone,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.quantity ? (
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={() =>
                    activeList && removeItem(activeList.id, item.id)
                  }
                >
                  <Text style={styles.remove}>🗑</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  webLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  mobileLayout: {
    flex: 1,
  },
  listsSidebar: {
    width: 220,
  },
  listsTopBar: {
    marginBottom: 12,
  },
  listsHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  listRowActive: {
    backgroundColor: '#eff6ff',
  },
  listName: {
    fontSize: 14,
  },
  listNameActive: {
    fontWeight: '600',
    color: '#1d4ed8',
  },
  listSub: {
    fontSize: 11,
    opacity: 0.7,
  },
  listRemove: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
  listsPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  listPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  listPillActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  listPillText: {
    fontSize: 14,
  },
  listPillTextActive: {
    fontWeight: '600',
    color: '#1d4ed8',
  },
  newListBox: {
    marginTop: 8,
    gap: 4,
  },
  itemsContainer: {
    flex: 1,
  },
  activeListTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  filterPillActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  row: {
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
  itemTitle: {
    fontSize: 16,
  },
  itemTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemQuantity: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  remove: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
});

export default ShoppingListScreen;