// src/screens/FamilyScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/common/ScreenContainer';

type Role = 'owner' | 'admin' | 'member';

type FamilyMember = {
  id: string;
  name: string;
  email?: string;
  role: Role;
};

const createId = () => Math.random().toString(36).slice(2);

const FamilyScreen = () => {
  const { t, i18n } = useTranslation();

  // kezdeti család
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Te',
      role: 'owner',
      email: undefined,
    },
  ]);

  // aktuálisan belépett felhasználó
  const [currentUserId, setCurrentUserId] = useState<string>('1');

  const currentUser = useMemo(
    () => members.find((m) => m.id === currentUserId) ?? members[0],
    [members, currentUserId]
  );

  const currentRole: Role = currentUser?.role ?? 'member';

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('member');

  const canManageMembers = currentRole === 'owner' || currentRole === 'admin';

  const handleAddMember = () => {
    if (!canManageMembers) return;
    const trimmed = newName.trim();
    if (!trimmed) return;

    const member: FamilyMember = {
      id: createId(),
      name: trimmed,
      email: newEmail.trim() || undefined,
      role: newRole,
    };

    setMembers((prev) => [...prev, member]);
    setNewName('');
    setNewEmail('');
    setNewRole('member');
  };

  const handleRemoveMember = (id: string) => {
    if (!canManageMembers) return;
    if (id === currentUserId) return; // ne töröljük magunkat
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleChangeRole = (id: string, role: Role) => {
    if (!canManageMembers) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              role,
            }
          : m
      )
    );
  };

  const handleChangeLanguage = (lng: 'hu' | 'en' | 'de') => {
    i18n.changeLanguage(lng);
  };

  const renderMember = ({ item }: { item: FamilyMember }) => {
    const isCurrent = item.id === currentUserId;

    return (
      <View style={styles.memberRow}>
        <TouchableOpacity
          style={[styles.memberAvatar, isCurrent && styles.memberAvatarActive]}
          onPress={() => setCurrentUserId(item.id)}
        >
          <Text style={styles.memberAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.memberName}>
            {item.name}
            {isCurrent ? ' (' + (t('family.currentUser') || 'Aktív') + ')' : ''}
          </Text>
          <Text style={styles.memberRoleText}>{roleLabel(item.role, t)}</Text>
          {item.email ? (
            <Text style={styles.memberEmail}>{item.email}</Text>
          ) : null}
        </View>

        {canManageMembers && (
          <View style={styles.memberActions}>
            <View style={styles.rolePills}>
              <RolePill
                role="owner"
                active={item.role === 'owner'}
                label={t('family.roles.owner') || 'Owner'}
                onPress={() => handleChangeRole(item.id, 'owner')}
              />
              <RolePill
                role="admin"
                active={item.role === 'admin'}
                label={t('family.roles.admin') || 'Admin'}
                onPress={() => handleChangeRole(item.id, 'admin')}
              />
              <RolePill
                role="member"
                active={item.role === 'member'}
                label={t('family.roles.member') || 'Member'}
                onPress={() => handleChangeRole(item.id, 'member')}
              />
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveMember(item.id)}
            >
              <Text style={styles.removeBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('family.title') || 'Család'}</Text>

      {/* Aktív felhasználó blokk */}
      {currentUser && (
        <View style={styles.currentCard}>
          <Text style={styles.currentTitle}>
            {t('family.currentUser') || 'Aktív felhasználó'}
          </Text>
          <Text style={styles.currentName}>{currentUser.name}</Text>
          <Text style={styles.currentRole}>{roleLabel(currentRole, t)}</Text>
        </View>
      )}

      {/* Nyelvválasztó */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('settings.language') || 'Nyelv'}
        </Text>
        <View style={styles.langRow}>
          <LangButton
            label={t('settings.language.hu') || 'Magyar'}
            active={i18n.language === 'hu'}
            onPress={() => handleChangeLanguage('hu')}
          />
          <LangButton
            label={t('settings.language.de') || 'Deutsch'}
            active={i18n.language === 'de'}
            onPress={() => handleChangeLanguage('de')}
          />
          <LangButton
            label={t('settings.language.en') || 'English'}
            active={i18n.language === 'en'}
            onPress={() => handleChangeLanguage('en')}
          />
        </View>
      </View>

      {/* Családtagok listája */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('family.title') || 'Családtagok'}
        </Text>

        <FlatList
          data={members}
          keyExtractor={(m) => m.id}
          renderItem={renderMember}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {/* Új családtag hozzáadása */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('family.addMember') || 'Új családtag hozzáadása'}
        </Text>

        {!canManageMembers && (
          <Text style={styles.infoText}>
            {t('family.onlyAdminOwner') ||
              'Csak a tulajdonos vagy admin adhat hozzá új tagot.'}
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder={t('family.name') || 'Név'}
          value={newName}
          onChangeText={setNewName}
          editable={canManageMembers}
        />

        <TextInput
          style={styles.input}
          placeholder={t('family.email') || 'E-mail (opcionális)'}
          value={newEmail}
          onChangeText={setNewEmail}
          editable={canManageMembers}
        />

        <View style={styles.roleRow}>
          <RoleSelectChip
            label={t('family.roles.member') || 'Tag'}
            active={newRole === 'member'}
            onPress={() => canManageMembers && setNewRole('member')}
          />
          <RoleSelectChip
            label={t('family.roles.admin') || 'Admin'}
            active={newRole === 'admin'}
            onPress={() => canManageMembers && setNewRole('admin')}
          />
          <RoleSelectChip
            label={t('family.roles.owner') || 'Tulajdonos'}
            active={newRole === 'owner'}
            onPress={() => canManageMembers && setNewRole('owner')}
          />
        </View>

        <TouchableOpacity
          style={[styles.addBtn, !canManageMembers && styles.addBtnDisabled]}
          onPress={handleAddMember}
          disabled={!canManageMembers}
        >
          <Text style={styles.addBtnText}>
            {t('family.add') || 'Hozzáadás'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const roleLabel = (role: Role, t: any) => {
  switch (role) {
    case 'owner':
      return t('family.roles.owner') || 'Tulajdonos';
    case 'admin':
      return t('family.roles.admin') || 'Admin';
    default:
      return t('family.roles.member') || 'Tag';
  }
};

type LangButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const LangButton = ({ label, active, onPress }: LangButtonProps) => (
  <TouchableOpacity
    style={[styles.langBtn, active && styles.langBtnActive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.langBtnText,
        active && styles.langBtnTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

type RolePillProps = {
  role: Role;
  active: boolean;
  label: string;
  onPress: () => void;
};

const RolePill = ({ active, label, onPress }: RolePillProps) => (
  <TouchableOpacity
    style={[styles.rolePill, active && styles.rolePillActive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.rolePillText,
        active && styles.rolePillTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

type RoleSelectChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const RoleSelectChip = ({ label, active, onPress }: RoleSelectChipProps) => (
  <TouchableOpacity
    style={[styles.roleSelectChip, active && styles.roleSelectChipActive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.roleSelectChipText,
        active && styles.roleSelectChipTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  currentCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#eef2ff',
    marginBottom: 12,
  },
  currentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentName: {
    fontSize: 18,
    fontWeight: '700',
  },
  currentRole: {
    fontSize: 13,
    marginTop: 2,
    color: '#4b5563',
  },
  card: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    columnGap: 8,
  },
  langBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 8,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  langBtnText: {
    fontSize: 13,
    color: '#111827',
  },
  langBtnTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  memberAvatarActive: {
    backgroundColor: '#2563eb',
  },
  memberAvatarText: {
    color: '#111827',
    fontWeight: '700',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberRoleText: {
    fontSize: 12,
    color: '#6b7280',
  },
  memberEmail: {
    fontSize: 12,
    color: '#4b5563',
  },
  memberActions: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  rolePills: {
    flexDirection: 'row',
    columnGap: 4,
    marginBottom: 4,
  },
  rolePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rolePillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  rolePillText: {
    fontSize: 11,
    color: '#111827',
  },
  rolePillTextActive: {
    color: '#ffffff',
  },
  removeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  removeBtnText: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    columnGap: 8,
    marginBottom: 8,
  },
  roleSelectChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleSelectChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  roleSelectChipText: {
    fontSize: 13,
    color: '#111827',
  },
  roleSelectChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  addBtn: {
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default FamilyScreen;