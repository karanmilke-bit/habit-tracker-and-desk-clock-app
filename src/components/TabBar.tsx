import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabType } from '../types';
import { useApp } from '../context/AppContext';

interface TabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

interface TabItem {
  key: TabType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { key: 'today', label: 'Today', icon: 'today-outline', activeIcon: 'today' },
  { key: 'habits', label: 'Habits', icon: 'flame-outline', activeIcon: 'flame' },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline', activeIcon: 'checkbox' },
  { key: 'clock', label: 'Clock', icon: 'time-outline', activeIcon: 'time' },
  { key: 'analytics', label: 'Insights', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
];

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onSelectTab }) => {
  const { theme } = useApp();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.cardBorder,
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onSelectTab(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <View
              style={[
                styles.iconContainer,
                isActive && { backgroundColor: theme.primaryLight },
              ]}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={20}
                color={isActive ? theme.primary : theme.textSecondary}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.primary : theme.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'web' ? 14 : 24,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
  },
});
