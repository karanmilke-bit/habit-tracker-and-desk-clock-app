import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/context/AppContext';
import { TabType, TaskPriority } from './src/types';
import { Header } from './src/components/Header';
import { HabitCard } from './src/components/HabitCard';
import { TaskItem } from './src/components/TaskItem';
import { TabBar } from './src/components/TabBar';
import { AddModal } from './src/components/AddModal';
import { AnalyticsView } from './src/components/AnalyticsView';
import { WorkClockTimer } from './src/components/WorkClockTimer';
import { ConfettiOverlay } from './src/components/ConfettiOverlay';
import { getTodayDateString } from './src/utils/dateUtils';

const MainScreen: React.FC = () => {
  const {
    theme,
    themeMode,
    habits,
    tasks,
    todayStats,
    celebration,
    dismissCelebration,
  } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<'habit' | 'task'>('habit');

  // Task filter state
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  // Habit filter state
  const [habitCategoryFilter, setHabitCategoryFilter] = useState<string>('all');

  const todayStr = getTodayDateString();

  const openAdd = (type: 'habit' | 'task') => {
    setModalInitialType(type);
    setModalVisible(true);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    if (taskFilter === 'high') return t.priority === 'high';
    return true;
  });

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    if (habitCategoryFilter === 'all') return true;
    return h.category === habitCategoryFilter;
  });

  const uniqueHabitCategories = ['all', ...Array.from(new Set(habits.map((h) => h.category)))];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {/* Main Container - Responsive Max-Width for Web/Desktop */}
      <View style={[styles.appWrapper, { backgroundColor: theme.background }]}>
        <Header />

        {/* Content Tabs */}
        <View style={styles.tabContent}>
          {activeTab === 'today' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollPadding}
            >
              {/* Daily Progress Banner */}
              <View
                style={[
                  styles.progressCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>Today's Target</Text>
                    <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                      {todayStats.habitsCompleted + todayStats.tasksCompleted} of{' '}
                      {todayStats.habitsTotal + todayStats.tasksTotal} actions completed
                    </Text>
                  </View>
                  <View style={[styles.percentageBadge, { backgroundColor: `${theme.primary}20` }]}>
                    <Text style={[styles.percentageText, { color: theme.primary }]}>
                      {todayStats.overallCompletionRate}%
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: theme.inputBg }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${todayStats.overallCompletionRate}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Today's Habits Section */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="flame" size={18} color="#F97316" />
                  <Text style={[styles.sectionHeading, { color: theme.text }]}>
                    Today's Habits ({todayStats.habitsCompleted}/{todayStats.habitsTotal})
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openAdd('habit')}>
                  <Text style={[styles.linkText, { color: theme.primary }]}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {habits.length === 0 ? (
                <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
                  <Ionicons name="flame-outline" size={36} color={theme.textMuted} />
                  <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                    No habits set yet
                  </Text>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: theme.primaryLight }]}
                    onPress={() => openAdd('habit')}
                  >
                    <Text style={[styles.smallBtnText, { color: theme.primary }]}>Create Your First Habit</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                habits.map((habit) => <HabitCard key={habit.id} habit={habit} showWeekStrip={true} />)
              )}

              {/* Today's Priority Tasks Section */}
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="checkbox" size={18} color={theme.primary} />
                  <Text style={[styles.sectionHeading, { color: theme.text }]}>
                    Today's Tasks ({todayStats.tasksCompleted}/{todayStats.tasksTotal})
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openAdd('task')}>
                  <Text style={[styles.linkText, { color: theme.primary }]}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {tasks.length === 0 ? (
                <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
                  <Ionicons name="checkmark-done-circle-outline" size={36} color={theme.textMuted} />
                  <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                    No tasks created yet
                  </Text>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: theme.primaryLight }]}
                    onPress={() => openAdd('task')}
                  >
                    <Text style={[styles.smallBtnText, { color: theme.primary }]}>Add a Task</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                tasks.slice(0, 5).map((task) => <TaskItem key={task.id} task={task} />)
              )}
            </ScrollView>
          )}

          {activeTab === 'habits' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollPadding}
            >
              {/* Category Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
              >
                {uniqueHabitCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          habitCategoryFilter === cat ? theme.primary : theme.card,
                        borderColor:
                          habitCategoryFilter === cat ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setHabitCategoryFilter(cat)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            habitCategoryFilter === cat ? '#FFFFFF' : theme.textSecondary,
                          fontWeight: habitCategoryFilter === cat ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} showWeekStrip={true} />
              ))}
            </ScrollView>
          )}

          {activeTab === 'tasks' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollPadding}
            >
              {/* Filter Chips */}
              <View style={styles.taskFilterRow}>
                {(['all', 'pending', 'completed', 'high'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.taskFilterBtn,
                      {
                        backgroundColor: taskFilter === filter ? theme.primary : theme.card,
                        borderColor: taskFilter === filter ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setTaskFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.taskFilterText,
                        {
                          color: taskFilter === filter ? '#FFFFFF' : theme.textSecondary,
                          fontWeight: taskFilter === filter ? '700' : '500',
                        },
                      ]}
                    >
                      {filter.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {filteredTasks.length === 0 ? (
                <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
                  <Ionicons name="file-tray-outline" size={36} color={theme.textMuted} />
                  <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                    No tasks match this filter
                  </Text>
                </View>
              ) : (
                filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
              )}
            </ScrollView>
          )}

          {activeTab === 'clock' && <WorkClockTimer />}

          {activeTab === 'analytics' && <AnalyticsView />}
        </View>

        {/* Floating Action Button (hidden in clock and analytics tabs) */}
        {activeTab !== 'clock' && activeTab !== 'analytics' && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary }]}
            onPress={() => openAdd(activeTab === 'tasks' ? 'task' : 'habit')}
            accessibilityLabel="Add new item"
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Bottom Tab Bar */}
        <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Add Modal */}
        <AddModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          defaultType={modalInitialType}
        />

        {/* Celebration Confetti Overlay */}
        <ConfettiOverlay
          visible={celebration.visible}
          title={celebration.title}
          subtitle={celebration.subtitle}
          onDismiss={dismissCelebration}
        />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainScreen />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 680 : undefined,
    alignSelf: 'center',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#E2E8F020',
  },
  tabContent: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 80,
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 13,
  },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
  },
  taskFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  taskFilterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  taskFilterText: {
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 70 : 80,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 99,
  },
});
