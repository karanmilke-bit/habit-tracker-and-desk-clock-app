import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { HabitCategory, TaskCategory, TaskPriority } from '../types';
import { getTodayDateString, formatDateString } from '../utils/dateUtils';

interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  defaultType?: 'habit' | 'task';
}

const HABIT_CATEGORIES: HabitCategory[] = [
  'Health',
  'Fitness',
  'Productivity',
  'Learning',
  'Mindfulness',
  'Personal',
];

const TASK_CATEGORIES: TaskCategory[] = [
  'Work',
  'Personal',
  'Fitness',
  'Study',
  'Shopping',
  'Health',
];

const COLOR_PALETTE = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F97316', // Orange
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#F59E0B', // Amber
];

const ICON_CHOICES = [
  'star',
  'flame',
  'fitness',
  'book',
  'water',
  'leaf',
  'heart',
  'flash',
  'barbell',
  'bicycle',
];

export const AddModal: React.FC<AddModalProps> = ({
  visible,
  onClose,
  defaultType = 'habit',
}) => {
  const { theme, addHabit, addTask } = useApp();
  const [modalType, setModalType] = useState<'habit' | 'task'>(defaultType);

  // Habit Form State
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('Fitness');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekdays' | 'weekends'>('daily');
  const [habitColor, setHabitColor] = useState(COLOR_PALETTE[2]); // orange
  const [habitIcon, setHabitIcon] = useState('fitness');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Work');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueType, setTaskDueType] = useState<'today' | 'tomorrow' | 'someday'>('today');

  const handleCreateHabit = () => {
    if (!habitTitle.trim()) return;
    addHabit({
      title: habitTitle,
      category: habitCategory,
      frequency: habitFrequency,
      color: habitColor,
      icon: habitIcon,
    });
    setHabitTitle('');
    onClose();
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    let dueDate = getTodayDateString();
    if (taskDueType === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = formatDateString(tomorrow);
    } else if (taskDueType === 'someday') {
      dueDate = '';
    }

    addTask({
      title: taskTitle,
      category: taskCategory,
      priority: taskPriority,
      dueDate,
    });
    setTaskTitle('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.sheetContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.typeToggle, { backgroundColor: theme.inputBg }]}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  modalType === 'habit' && { backgroundColor: theme.primary },
                ]}
                onPress={() => setModalType('habit')}
              >
                <Ionicons
                  name="flame"
                  size={15}
                  color={modalType === 'habit' ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    { color: modalType === 'habit' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Habit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  modalType === 'task' && { backgroundColor: theme.primary },
                ]}
                onPress={() => setModalType('task')}
              >
                <Ionicons
                  name="checkbox"
                  size={15}
                  color={modalType === 'task' ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    { color: modalType === 'task' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Task
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {modalType === 'habit' ? (
              // Habit Form
              <>
                <Text style={[styles.label, { color: theme.textSecondary }]}>HABIT TITLE</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="e.g. Read 20 mins, Drink water, Gym"
                  placeholderTextColor={theme.textMuted}
                  value={habitTitle}
                  onChangeText={setHabitTitle}
                />

                {/* Category Chips */}
                <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
                <View style={styles.chipRow}>
                  {HABIT_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: habitCategory === cat ? `${theme.primary}25` : theme.inputBg,
                          borderColor: habitCategory === cat ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setHabitCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: habitCategory === cat ? theme.primary : theme.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Frequency */}
                <Text style={[styles.label, { color: theme.textSecondary }]}>FREQUENCY</Text>
                <View style={styles.chipRow}>
                  {(['daily', 'weekdays', 'weekends'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: habitFrequency === freq ? `${theme.primary}25` : theme.inputBg,
                          borderColor: habitFrequency === freq ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setHabitFrequency(freq)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: habitFrequency === freq ? theme.primary : theme.textSecondary },
                        ]}
                      >
                        {freq.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Color Palette */}
                <Text style={[styles.label, { color: theme.textSecondary }]}>THEME COLOR</Text>
                <View style={styles.paletteRow}>
                  {COLOR_PALETTE.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        habitColor === color && styles.colorCircleSelected,
                      ]}
                      onPress={() => setHabitColor(color)}
                    >
                      {habitColor === color && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Icon Selection */}
                <Text style={[styles.label, { color: theme.textSecondary }]}>ICON</Text>
                <View style={styles.iconPickerRow}>
                  {ICON_CHOICES.map((ic) => (
                    <TouchableOpacity
                      key={ic}
                      style={[
                        styles.iconPickerBtn,
                        {
                          backgroundColor: habitIcon === ic ? `${habitColor}30` : theme.inputBg,
                          borderColor: habitIcon === ic ? habitColor : theme.border,
                        },
                      ]}
                      onPress={() => setHabitIcon(ic)}
                    >
                      <Ionicons
                        name={ic as any}
                        size={20}
                        color={habitIcon === ic ? habitColor : theme.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: habitTitle.trim() ? habitColor : theme.textMuted },
                  ]}
                  onPress={handleCreateHabit}
                  disabled={!habitTitle.trim()}
                >
                  <Text style={styles.btnText}>Add Habit</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Task Form
              <>
                <Text style={[styles.label, { color: theme.textSecondary }]}>TASK TITLE</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="e.g. Finish project proposal, Pay bills"
                  placeholderTextColor={theme.textMuted}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />

                {/* Category Chips */}
                <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
                <View style={styles.chipRow}>
                  {TASK_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: taskCategory === cat ? `${theme.primary}25` : theme.inputBg,
                          borderColor: taskCategory === cat ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setTaskCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: taskCategory === cat ? theme.primary : theme.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Priority Selection */}
                <Text style={[styles.label, { color: theme.textSecondary }]}>PRIORITY</Text>
                <View style={styles.chipRow}>
                  {(['low', 'medium', 'high'] as const).map((pri) => {
                    const isSelected = taskPriority === pri;
                    const priColor =
                      pri === 'high'
                        ? theme.danger
                        : pri === 'medium'
                        ? theme.warning
                        : theme.primary;
                    return (
                      <TouchableOpacity
                        key={pri}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? `${priColor}25` : theme.inputBg,
                            borderColor: isSelected ? priColor : theme.border,
                          },
                        ]}
                        onPress={() => setTaskPriority(pri)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: isSelected ? priColor : theme.textSecondary, fontWeight: '700' },
                          ]}
                        >
                          {pri.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Due Date quick picker */}
                <Text style={[styles.label, { color: theme.textSecondary }]}>DUE DATE</Text>
                <View style={styles.chipRow}>
                  {(['today', 'tomorrow', 'someday'] as const).map((due) => (
                    <TouchableOpacity
                      key={due}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: taskDueType === due ? `${theme.primary}25` : theme.inputBg,
                          borderColor: taskDueType === due ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setTaskDueType(due)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: taskDueType === due ? theme.primary : theme.textSecondary },
                        ]}
                      >
                        {due === 'today' ? 'Today' : due === 'tomorrow' ? 'Tomorrow' : 'No Date'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: taskTitle.trim() ? theme.primary : theme.textMuted },
                  ]}
                  onPress={handleCreateTask}
                  disabled={!taskTitle.trim()}
                >
                  <Text style={styles.btnText}>Add Task</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'web' ? 24 : 36,
    borderTopWidth: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  iconPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconPickerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
