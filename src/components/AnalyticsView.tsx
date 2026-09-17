import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getPastDays } from '../utils/dateUtils';
import { CATEGORY_COLORS } from '../constants/theme';

export const AnalyticsView: React.FC = () => {
  const { theme, habits, tasks, todayStats } = useApp();
  const pastDays = getPastDays(7);

  // Calculate completions for each of past 7 days
  const dailyActivity = pastDays.map(({ dateStr, dayLabel }) => {
    let count = 0;
    habits.forEach((h) => {
      if (h.completedDates.includes(dateStr)) count++;
    });
    tasks.forEach((t) => {
      if (t.completed && t.completedAt && t.completedAt.startsWith(dateStr)) count++;
    });
    return { dateStr, dayLabel, count };
  });

  const maxDailyCount = Math.max(...dailyActivity.map((d) => d.count), 1);

  // Habit metrics
  const totalHabitCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const bestStreakEver = Math.max(...habits.map((h) => h.longestStreak), 0);
  const activeStreaksCount = habits.filter((h) => h.currentStreak > 0).length;

  // Task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Category breakdown
  const categoryStats: Record<string, { total: number; completed: number; color: string }> = {};

  habits.forEach((h) => {
    if (!categoryStats[h.category]) {
      categoryStats[h.category] = {
        total: 0,
        completed: 0,
        color: CATEGORY_COLORS[h.category] || theme.primary,
      };
    }
    categoryStats[h.category].total++;
    if (h.currentStreak > 0) {
      categoryStats[h.category].completed++;
    }
  });

  tasks.forEach((t) => {
    if (!categoryStats[t.category]) {
      categoryStats[t.category] = {
        total: 0,
        completed: 0,
        color: CATEGORY_COLORS[t.category] || theme.primary,
      };
    }
    categoryStats[t.category].total++;
    if (t.completed) {
      categoryStats[t.category].completed++;
    }
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance & Insights</Text>

      {/* Top Highlight Cards */}
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="trophy" size={20} color={theme.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>{bestStreakEver} Days</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Streak</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${theme.success}20` }]}>
            <Ionicons name="checkmark-done" size={20} color={theme.success} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>{totalHabitCompletions}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Check-ins</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${theme.secondary}20` }]}>
            <Ionicons name="flame" size={20} color={theme.secondary} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>{activeStreaksCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Streaks</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${theme.warning}20` }]}>
            <Ionicons name="pie-chart" size={20} color={theme.warning} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>{taskCompletionRate}%</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Task Rate</Text>
        </View>
      </View>

      {/* 7-Day Activity Chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>7-Day Activity</Text>
          <Text style={[styles.chartSubtitle, { color: theme.textSecondary }]}>
            Habits & tasks completed
          </Text>
        </View>

        <View style={styles.barsContainer}>
          {dailyActivity.map((day) => {
            const heightPercent = Math.max((day.count / maxDailyCount) * 100, 10);
            return (
              <View key={day.dateStr} style={styles.barColumn}>
                <Text style={[styles.barCount, { color: theme.textSecondary }]}>{day.count}</Text>
                <View style={[styles.barTrack, { backgroundColor: theme.inputBg }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: day.count > 0 ? theme.primary : theme.border,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barDay, { color: theme.textSecondary }]}>{day.dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={[styles.categoryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Category Breakdown</Text>
        <View style={styles.categoryList}>
          {Object.entries(categoryStats).map(([name, stat]) => {
            const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
            return (
              <View key={name} style={styles.catRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catIndicator, { backgroundColor: stat.color }]} />
                  <Text style={[styles.catName, { color: theme.text }]}>{name}</Text>
                </View>
                <View style={styles.catRight}>
                  <View style={[styles.progressTrack, { backgroundColor: theme.inputBg }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: stat.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.catPct, { color: theme.textSecondary }]}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barCount: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 80,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDay: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryList: {
    marginTop: 12,
    gap: 12,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    gap: 8,
  },
  catIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 13,
    fontWeight: '500',
  },
  catRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  catPct: {
    fontSize: 12,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
});
