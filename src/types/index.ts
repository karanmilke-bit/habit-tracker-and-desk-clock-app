export type HabitCategory = 
  | 'Health'
  | 'Fitness'
  | 'Productivity'
  | 'Learning'
  | 'Mindfulness'
  | 'Personal';

export type TaskCategory = 
  | 'Work'
  | 'Personal'
  | 'Fitness'
  | 'Study'
  | 'Shopping'
  | 'Health';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekdays' | 'weekends';
  color: string;
  icon: string;
  createdAt: string;
  completedDates: string[]; // Format: 'YYYY-MM-DD'
  currentStreak: number;
  longestStreak: number;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // Format: 'YYYY-MM-DD'
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type TabType = 'today' | 'habits' | 'tasks' | 'clock' | 'analytics';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  inputBg: string;
}
