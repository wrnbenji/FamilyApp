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
  const { todos, addTodo, toggleTodo, removeTodo, clearAll } = useTodoStore();

  const handleAdd = () => {
    if (!title.trim()) return;
    addTodo(title.trim(), 'medium');
    setTitle('');
  };

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

      <View style={{ marginBottom: 8 }}>
        <Button title="Összes törlése" onPress={clearAll} />
      </View>

      <FlatList
        data={todos}
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