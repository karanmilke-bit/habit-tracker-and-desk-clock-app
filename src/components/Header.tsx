import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    theme,
    themeMode,
    toggleTheme,
    todayStats,
    resetToDemoData,
    notificationsEnabled,
    toggleNotifications,
  } = useApp();

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome Back</Text>
        <Text style={[styles.dateText, { color: theme.text }]}>{todayFormatted}</Text>
      </View>

      <View style={styles.actionsContainer}>
        {/* Progress pill */}
        <View style={[styles.progressBadge, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="sparkles" size={14} color={theme.primary} />
          <Text style={[styles.progressText, { color: theme.primary }]}>
            {todayStats.overallCompletionRate}% Done
          </Text>
        </View>

        {/* Notification toggle */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
            notificationsEnabled && { borderColor: theme.primary },
          ]}
          onPress={toggleNotifications}
          accessibilityLabel="Toggle daily reminder notifications"
        >
          <Ionicons
            name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
            size={18}
            color={notificationsEnabled ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>

        {/* Demo data refresh */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={resetToDemoData}
          accessibilityLabel="Reset demo data"
        >
          <Ionicons name="refresh-outline" size={18} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Theme toggle */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={toggleTheme}
          accessibilityLabel="Toggle dark/light mode"
        >
          <Ionicons
            name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={themeMode === 'dark' ? '#FBBF24' : '#6366F1'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
