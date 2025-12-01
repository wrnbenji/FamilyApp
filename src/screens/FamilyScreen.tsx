import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '../components/common/ScreenContainer';
import {
  useFamilyStore,
  FamilyMember,
  FamilyRole,
} from '../store/familyStore';

const FamilyScreen = () => {
  const { t, i18n } = useTranslation();
  const {
    members,
    currentUserId,
    addMember,
    removeMember,
    setRole,
    setCurrentUser,
  } = useFamilyStore();

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<FamilyRole>('member');

  const currentUser = members.find((m) => m.id === currentUserId);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMember(newName, newRole);
    setNewName('');
    setNewRole('member');
  };

  const renderRoleBadge = (member: FamilyMember) => {
    const role = member.role;
    const label =
      role === 'owner'
        ? t('family.roles.owner') || 'Owner'
        : role === 'admin'
        ? t('family.roles.admin') || 'Admin'
        : t('family.roles.member') || 'User';

    const style =
      role === 'owner'
        ? styles.roleOwner
        : role === 'admin'
        ? styles.roleAdmin
        : styles.roleMember;

    return (
      <View style={[styles.roleBadge, style]}>
        <Text style={styles.roleBadgeText}>{label}</Text>
      </View>
    );
  };

  const changeLanguage = (lng: 'hu' | 'en' | 'de') => {
    i18n.changeLanguage(lng);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>
        {t('family.title') || 'Familienmitglieder'}
      </Text>

      {/* AKTUÁLIS FELHASZNÁLÓ (pseudo-login) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t('family.currentUser') || 'Aktueller Benutzer'}
        </Text>

        <View style={styles.currentUserRow}>
          {members.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.currentUserChip,
                m.id === currentUserId && styles.currentUserChipActive,
              ]}
              onPress={() => setCurrentUser(m.id)}
            >
              <Text
                style={[
                  styles.currentUserText,
                  m.id === currentUserId && styles.currentUserTextActive,
                ]}
              >
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {currentUser && (
          <Text style={styles.currentUserInfo}>
            {t('family.loginAs') || 'Bejelentkezve mint'}:{' '}
            <Text style={{ fontWeight: '600' }}>{currentUser.name}</Text>
          </Text>
        )}
      </View>

      {/* NYELVVÁLASZTÓ */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t('settings.language') || 'Sprache'}
        </Text>
        <View style={styles.languageRow}>
          <LangButton
            label="MAGYAR"
            active={i18n.language.startsWith('hu')}
            onPress={() => changeLanguage('hu')}
          />
          <LangButton
            label="ENGLISH"
            active={i18n.language.startsWith('en')}
            onPress={() => changeLanguage('en')}
          />
          <LangButton
            label="DEUTSCH"
            active={i18n.language.startsWith('de')}
            onPress={() => changeLanguage('de')}
          />
        </View>
      </View>

      {/* ÚJ CSALÁDTAG HOZZÁADÁSA */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t('family.addMember') || 'Familienmitglied hinzufügen'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('family.name') || 'Name'}
          value={newName}
          onChangeText={setNewName}
        />

        <View style={styles.roleSelectRow}>
          <RoleChip
            label={t('family.roles.owner') || 'Owner'}
            active={newRole === 'owner'}
            onPress={() => setNewRole('owner')}
          />
          <RoleChip
            label={t('family.roles.admin') || 'Admin'}
            active={newRole === 'admin'}
            onPress={() => setNewRole('admin')}
          />
          <RoleChip
            label={t('family.roles.member') || 'User'}
            active={newRole === 'member'}
            onPress={() => setNewRole('member')}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>
            {t('family.add') || 'Hinzufügen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAGLISTA */}
      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            {/* kis „avatar” kör */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={styles.memberRoleText}>
                {item.role === 'owner'
                  ? t('family.roles.owner') || 'Owner'
                  : item.role === 'admin'
                  ? t('family.roles.admin') || 'Admin'
                  : t('family.roles.member') || 'User'}
              </Text>
            </View>

            {/* szerep-váltó gombok */}
            <View style={styles.memberRoleButtons}>
              <SmallRoleButton
                label={t('family.roles.owner') || 'Owner'}
                active={item.role === 'owner'}
                onPress={() => setRole(item.id, 'owner')}
              />
              <SmallRoleButton
                label={t('family.roles.admin') || 'Admin'}
                active={item.role === 'admin'}
                onPress={() => setRole(item.id, 'admin')}
              />
              <SmallRoleButton
                label={t('family.roles.member') || 'User'}
                active={item.role === 'member'}
                onPress={() => setRole(item.id, 'member')}
              />
            </View>

            {/* törlés (owner védve a store-ban) */}
            <TouchableOpacity onPress={() => removeMember(item.id)}>
              <Text style={styles.trash}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

type LangProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const LangButton = ({ label, active, onPress }: LangProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.langButton,
      active && styles.langButtonActive,
    ]}
  >
    <Text
      style={[
        styles.langButtonText,
        active && styles.langButtonTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

type RoleChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const RoleChip = ({ label, active, onPress }: RoleChipProps) => (
  <TouchableOpacity
    style={[styles.roleChip, active && styles.roleChipActive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.roleChipText,
        active && styles.roleChipTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

type SmallRoleProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const SmallRoleButton = ({ label, active, onPress }: SmallRoleProps) => (
  <TouchableOpacity
    style={[
      styles.smallRoleButton,
      active && styles.smallRoleButtonActive,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.smallRoleText,
        active && styles.smallRoleTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  currentUserRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currentUserChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
  },
  currentUserChipActive: {
    backgroundColor: '#2563eb22',
  },
  currentUserText: {
    fontSize: 13,
  },
  currentUserTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  currentUserInfo: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.8,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  langButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  langButtonText: {
    fontSize: 13,
  },
  langButtonTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  roleSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleChipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roleChipText: {
    fontSize: 13,
  },
  roleChipTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  addButton: {
    alignSelf: 'stretch',
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    marginTop: 2,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontWeight: '600',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  memberRoleText: {
    fontSize: 12,
    opacity: 0.7,
  },
  memberRoleButtons: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 4,
  },
  smallRoleButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallRoleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  smallRoleText: {
    fontSize: 11,
  },
  smallRoleTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  trash: {
    fontSize: 18,
    paddingHorizontal: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 11,
    color: '#fff',
  },
  roleOwner: {
    backgroundColor: '#1d4ed8',
  },
  roleAdmin: {
    backgroundColor: '#16a34a',
  },
  roleMember: {
    backgroundColor: '#6b7280',
  },
});

export default FamilyScreen;