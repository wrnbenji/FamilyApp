// src/screens/FamilyScreen.tsx
import React, { useMemo, useState } from 'react';
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
import i18n from '../i18n';
import { useFamilyStore, FamilyRole } from '../store/familyStore';

const FamilyScreen = () => {
  const { t } = useTranslation();
  const {
    members,
    currentUserId,
    addMember,
    removeMember,
    updateRole,
    setCurrentUser,
  } = useFamilyStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState<FamilyRole>('MEMBER');

  const currentUser = useMemo(
    () => members.find((m) => m.id === currentUserId) || members[0],
    [members, currentUserId]
  );

  const changeLanguage = (lng: 'hu' | 'en' | 'de') => {
    i18n.changeLanguage(lng);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addMember(name.trim(), role);
    setName('');
    setRole('MEMBER');
  };

  const roleLabel = (r: FamilyRole) => {
    if (r === 'OWNER') return t('family.owner');
    if (r === 'ADMIN') return t('family.admin');
    return t('family.member');
  };

  // 👉 jogosultság logika: csak OWNER vagy ADMIN tud meghívni / törölni
  const canManageMembers =
    currentUser && (currentUser.role === 'OWNER' || currentUser.role === 'ADMIN');

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('family.title')}</Text>

      {/* Aktív felhasználó választás */}
      <Text style={styles.sectionTitle}>{t('family.currentUser')}:</Text>
      <View style={styles.currentUserRow}>
        {members.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.currentUserChip,
              m.id === currentUser?.id && styles.currentUserChipActive,
            ]}
            onPress={() => setCurrentUser(m.id)}
          >
            <Text style={styles.currentUserChipText}>
              {m.name} ({roleLabel(m.role)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nyelvváltás */}
      <Text style={styles.sectionTitle}>{t('settings.language')}:</Text>
      <View style={styles.langRow}>
        <Button title={t('settings.language.hu')} onPress={() => changeLanguage('hu')} />
        <Button title={t('settings.language.en')} onPress={() => changeLanguage('en')} />
        <Button title={t('settings.language.de')} onPress={() => changeLanguage('de')} />
      </View>

      {/* Új tag hozzáadása */}
      <Text style={styles.sectionTitle}>{t('family.addMember')}</Text>
      {!canManageMembers && (
        <Text style={styles.infoText}>
          {t('family.owner')} / {t('family.admin')} tud új tagot hozzáadni.
        </Text>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder={t('family.name') || 'Name'}
          value={name}
          onChangeText={setName}
          editable={canManageMembers}
        />
      </View>

      {/* Szerep választó az új taghoz */}
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'OWNER' && styles.roleButtonActive,
            !canManageMembers && styles.roleButtonDisabled,
          ]}
          onPress={() => canManageMembers && setRole('OWNER')}
        >
          <Text style={styles.roleButtonText}>{t('family.owner')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'ADMIN' && styles.roleButtonActive,
            !canManageMembers && styles.roleButtonDisabled,
          ]}
          onPress={() => canManageMembers && setRole('ADMIN')}
        >
          <Text style={styles.roleButtonText}>{t('family.admin')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'MEMBER' && styles.roleButtonActive,
            !canManageMembers && styles.roleButtonDisabled,
          ]}
          onPress={() => canManageMembers && setRole('MEMBER')}
        >
          <Text style={styles.roleButtonText}>{t('family.member')}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Button
          title={t('family.addButton')}
          onPress={handleAdd}
          disabled={!canManageMembers}
        />
      </View>

      {/* Tag lista */}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('family.noMembers')}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: item.color || '#ccc' },
              ]}
            >
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={styles.memberRoleText}>{roleLabel(item.role)}</Text>

              <View style={styles.memberRoleRow}>
                {/* Szerep módosítás – ez is csak OWNER/ADMIN-nak engedett */}
                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    item.role === 'OWNER' && styles.rolePillActive,
                    !canManageMembers && styles.rolePillDisabled,
                  ]}
                  onPress={() => canManageMembers && updateRole(item.id, 'OWNER')}
                >
                  <Text style={styles.rolePillText}>{t('family.owner')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    item.role === 'ADMIN' && styles.rolePillActive,
                    !canManageMembers && styles.rolePillDisabled,
                  ]}
                  onPress={() => canManageMembers && updateRole(item.id, 'ADMIN')}
                >
                  <Text style={styles.rolePillText}>{t('family.admin')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    item.role === 'MEMBER' && styles.rolePillActive,
                    !canManageMembers && styles.rolePillDisabled,
                  ]}
                  onPress={() => canManageMembers && updateRole(item.id, 'MEMBER')}
                >
                  <Text style={styles.rolePillText}>{t('family.member')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Törlés – szintén csak OWNER/ADMIN, és ne engedjük magunkat törölni */}
            {canManageMembers && item.id !== currentUser?.id && (
              <TouchableOpacity onPress={() => removeMember(item.id)}>
                <Text style={styles.remove}>🗑</Text>
              </TouchableOpacity>
            )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  currentUserRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  currentUserChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  currentUserChipActive: {
    backgroundColor: '#ddd',
  },
  currentUserChipText: {
    fontSize: 12,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  roleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleButtonActive: {
    backgroundColor: '#ddd',
  },
  roleButtonDisabled: {
    opacity: 0.5,
  },
  roleButtonText: {
    fontSize: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRoleText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  memberRoleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rolePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rolePillActive: {
    backgroundColor: '#eee',
  },
  rolePillDisabled: {
    opacity: 0.5,
  },
  rolePillText: {
    fontSize: 12,
  },
  remove: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
});

export default FamilyScreen;