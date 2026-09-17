import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, Task, ThemeMode } from '../types';
import { getTodayDateString, formatDateString, calculateStreaks } from '../utils/dateUtils';

const HABITS_KEY = '@habits_data_v1';
const TASKS_KEY = '@tasks_data_v1';
const THEME_KEY = '@theme_mode_v1';

export function getInitialHabits(): Habit[] {
  const today = new Date();
  const d1 = formatDateString(today);
  const d2Date = new Date(today);
  d2Date.setDate(today.getDate() - 1);
  const d2 = formatDateString(d2Date);
  const d3Date = new Date(today);
  d3Date.setDate(today.getDate() - 2);
  const d3 = formatDateString(d3Date);

  const initial: Habit[] = [
    {
      id: 'habit-1',
      title: 'Morning 20m Run',
      category: 'Fitness',
      frequency: 'daily',
      color: '#F97316',
      icon: 'fitness',
      createdAt: new Date().toISOString(),
      completedDates: [d1, d2, d3],
      currentStreak: 3,
      longestStreak: 5,
    },
    {
      id: 'habit-2',
      title: 'Read 15 Pages',
      category: 'Learning',
      frequency: 'daily',
      color: '#8B5CF6',
      icon: 'book',
      createdAt: new Date().toISOString(),
      completedDates: [d2, d3],
      currentStreak: 2,
      longestStreak: 7,
    },
    {
      id: 'habit-3',
      title: 'Drink 2.5L Water',
      category: 'Health',
      frequency: 'daily',
      color: '#10B981',
      icon: 'water',
      createdAt: new Date().toISOString(),
      completedDates: [d1, d2],
      currentStreak: 2,
      longestStreak: 4,
    },
    {
      id: 'habit-4',
      title: '10m Mindfulness Meditation',
      category: 'Mindfulness',
      frequency: 'daily',
      color: '#06B6D4',
      icon: 'leaf',
      createdAt: new Date().toISOString(),
      completedDates: [d3],
      currentStreak: 0,
      longestStreak: 3,
    },
  ];

  return initial;
}

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDateString(tomorrowDate);

  return [
    {
      id: 'task-1',
      title: 'Finish cross-platform React Native prototype',
      category: 'Work',
      priority: 'high',
      dueDate: today,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Review Q3 goals and milestones',
      category: 'Productivity' as any,
      priority: 'medium',
      dueDate: today,
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Pick up groceries & meal prep',
      category: 'Shopping',
      priority: 'low',
      dueDate: tomorrow,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Schedule dentist appointment',
      category: 'Health',
      priority: 'medium',
      dueDate: tomorrow,
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function loadStoredHabits(): Promise<Habit[]> {
  try {
    const json = await AsyncStorage.getItem(HABITS_KEY);
    if (json) {
      const habits: Habit[] = JSON.parse(json);
      // Recalculate streak values dynamically based on current date
      return habits.map((h) => {
        const { currentStreak, longestStreak } = calculateStreaks(h.completedDates || []);
        return {
          ...h,
          currentStreak,
          longestStreak: Math.max(longestStreak, h.longestStreak || 0),
        };
      });
    }
    const defaults = getInitialHabits();
    await saveStoredHabits(defaults);
    return defaults;
  } catch (err) {
    console.error('Failed to load habits from storage:', err);
    return getInitialHabits();
  }
}

export async function saveStoredHabits(habits: Habit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (err) {
    console.error('Failed to save habits to storage:', err);
  }
}

export async function loadStoredTasks(): Promise<Task[]> {
  try {
    const json = await AsyncStorage.getItem(TASKS_KEY);
    if (json) {
      return JSON.parse(json);
    }
    const defaults = getInitialTasks();
    await saveStoredTasks(defaults);
    return defaults;
  } catch (err) {
    console.error('Failed to load tasks from storage:', err);
    return getInitialTasks();
  }
}

export async function saveStoredTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

export async function loadThemePreference(): Promise<ThemeMode> {
  try {
    const saved = await AsyncStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'dark'; // Default to a sleek modern dark theme
  } catch {
    return 'dark';
  }
}

export async function saveThemePreference(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, mode);
  } catch (err) {
    console.error('Failed to save theme preference:', err);
  }
}
