import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS } from '../constants/theme';
import { formatDisplayDate, getTodayDateString } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { theme, toggleTask, deleteTask } = useApp();
  const todayStr = getTodayDateString();
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const categoryColor = CATEGORY_COLORS[task.category] || theme.primary;

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return theme.danger;
      case 'medium':
        return theme.warning;
      case 'low':
      default:
        return theme.primary;
    }
  };

  const priorityColor = getPriorityColor();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: task.completed ? theme.cardBorder : isOverdue ? `${theme.danger}66` : theme.cardBorder,
          opacity: task.completed ? 0.7 : 1,
        },
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            backgroundColor: task.completed ? theme.primary : 'transparent',
            borderColor: task.completed ? theme.primary : theme.textMuted,
          },
        ]}
        onPress={() => toggleTask(task.id)}
        accessibilityLabel={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
      >
        {task.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </TouchableOpacity>

      {/* Task Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: task.completed ? theme.textMuted : theme.text,
              textDecorationLine: task.completed ? 'line-through' : 'none',
            },
          ]}
        >
          {task.title}
        </Text>

        {/* Badges Row */}
        <View style={styles.badgeRow}>
          {/* Category */}
          <View style={[styles.badge, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={[styles.badgeText, { color: categoryColor }]}>{task.category}</Text>
          </View>

          {/* Priority */}
          <View style={[styles.badge, { backgroundColor: `${priorityColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: priorityColor }]} />
            <Text style={[styles.badgeText, { color: priorityColor }]}>
              {task.priority.toUpperCase()}
            </Text>
          </View>

          {/* Due Date */}
          {task.dueDate && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isOverdue ? `${theme.danger}15` : theme.inputBg,
                },
              ]}
            >
              <Ionicons
                name={isOverdue ? 'alert-circle' : 'calendar-outline'}
                size={11}
                color={isOverdue ? theme.danger : theme.textSecondary}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: isOverdue ? theme.danger : theme.textSecondary, fontWeight: isOverdue ? '700' : '500' },
                ]}
              >
                {isOverdue ? `Overdue (${formatDisplayDate(task.dueDate)})` : formatDisplayDate(task.dueDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Delete Action */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(task.id)}
        accessibilityLabel="Delete task"
      >
        <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
});
