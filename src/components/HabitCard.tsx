import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { useApp } from '../context/AppContext';
import { getPastDays, getTodayDateString } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  showWeekStrip?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, showWeekStrip = true }) => {
  const { theme, toggleHabitDate, deleteHabit } = useApp();
  const todayStr = getTodayDateString();
  const pastDays = getPastDays(7);
  const isCompletedToday = habit.completedDates.includes(todayStr);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isCompletedToday ? `${habit.color}55` : theme.cardBorder,
        },
      ]}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View style={[styles.iconBox, { backgroundColor: `${habit.color}20` }]}>
            <Ionicons name={habit.icon as any || 'star'} size={20} color={habit.color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]}>{habit.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: `${habit.color}15` }]}>
                <Text style={[styles.categoryText, { color: habit.color }]}>{habit.category}</Text>
              </View>
              <Text style={[styles.frequencyText, { color: theme.textSecondary }]}>
                {habit.frequency}
              </Text>
            </View>
          </View>
        </View>

        {/* Streak & Today Check Action */}
        <View style={styles.rightActions}>
          <View style={[styles.streakPill, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="flame" size={16} color="#F97316" />
            <Text style={[styles.streakText, { color: theme.text }]}>{habit.currentStreak}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: isCompletedToday ? habit.color : 'transparent',
                borderColor: habit.color,
              },
            ]}
            onPress={() => toggleHabitDate(habit.id, todayStr)}
            accessibilityLabel={isCompletedToday ? 'Mark habit as incomplete' : 'Mark habit as complete'}
          >
            {isCompletedToday ? (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={18} color={habit.color} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteHabit(habit.id)}
            accessibilityLabel="Delete habit"
          >
            <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive 7-Day History Strip */}
      {showWeekStrip && (
        <View style={[styles.stripContainer, { borderTopColor: theme.cardBorder }]}>
          <Text style={[styles.stripLabel, { color: theme.textMuted }]}>Last 7 Days</Text>
          <View style={styles.daysRow}>
            {pastDays.map(({ dateStr, dayLabel, dayNumber }) => {
              const isCompleted = habit.completedDates.includes(dateStr);
              const isCurrentDay = dateStr === todayStr;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={styles.dayColumn}
                  onPress={() => toggleHabitDate(habit.id, dateStr)}
                >
                  <Text
                    style={[
                      styles.dayLabelText,
                      { color: isCurrentDay ? habit.color : theme.textSecondary, fontWeight: isCurrentDay ? '700' : '500' },
                    ]}
                  >
                    {dayLabel}
                  </Text>
                  <View
                    style={[
                      styles.dayDot,
                      {
                        backgroundColor: isCompleted ? habit.color : theme.inputBg,
                        borderColor: isCurrentDay ? habit.color : 'transparent',
                        borderWidth: isCurrentDay ? 1.5 : 0,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.dayNumberText, { color: theme.textMuted }]}>
                        {dayNumber}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  frequencyText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 3,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
  },
  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 6,
  },
  stripContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  stripLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabelText: {
    fontSize: 11,
    marginBottom: 4,
  },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
