// src/screens/TodosScreen.tsx
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
import { useTodoStore } from '../store/todoStore';

const TodosScreen = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'open' | 'done' | 'important'>('all');
  const { todos, addTodo, toggleTodo, removeTodo, clearAll } = useTodoStore();

  const handleAdd = () => {
    if (!title.trim()) return;
    addTodo(title.trim(), priority);
    setTitle('');
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'open') return !todo.done;
    if (filter === 'done') return todo.done;
    if (filter === 'important') return todo.priority === 'high';
    return true; // 'all'
  });

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('nav.todos')}</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Új teendő..."
          value={title}
          onChangeText={setTitle}
        />
        <Button title="+" onPress={handleAdd} />
      </View>

      {/* Prioritás választó */}
      <View style={styles.priorityRow}>
        <TouchableOpacity
          style={[
            styles.priorityPill,
            priority === 'low' && styles.priorityPillLow,
          ]}
          onPress={() => setPriority('low')}
        >
          <Text>Kicsi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.priorityPill,
            priority === 'medium' && styles.priorityPillMedium,
          ]}
          onPress={() => setPriority('medium')}
        >
          <Text>Közepes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.priorityPill,
            priority === 'high' && styles.priorityPillHigh,
          ]}
          onPress={() => setPriority('high')}
        >
          <Text>Fontos</Text>
        </TouchableOpacity>
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
          <Text>Aktív</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === 'done' && styles.filterPillActive,
          ]}
          onPress={() => setFilter('done')}
        >
          <Text>Kész</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === 'important' && styles.filterPillActive,
          ]}
          onPress={() => setFilter('important')}
        >
          <Text>Fontos</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Button title="Összes törlése" onPress={clearAll} />
      </View>

      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.todoRow}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)}>
              <Text style={[styles.checkbox, item.done && styles.checkboxDone]}>
                {item.done ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.todoText, item.done && styles.todoDone]}>
                {item.title}
              </Text>
              <Text style={styles.priorityText}>
                {t(`priority.${item.priority}`)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removeTodo(item.id)}>
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
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#f4f4f5',
  },
  priorityPillLow: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  priorityPillMedium: {
    backgroundColor: '#fef9c3',
    borderColor: '#eab308',
  },
  priorityPillHigh: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
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
  todoRow: {
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
  todoText: {
    fontSize: 16,
  },
  todoDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  priorityText: {
    fontSize: 12,
    opacity: 0.7,
  },
  remove: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
});

export default TodosScreen;