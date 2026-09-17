import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Habit, Task, ThemeMode, ThemeColors, HabitCategory, TaskCategory, TaskPriority } from '../types';
import { lightTheme, darkTheme } from '../constants/theme';
import {
  loadStoredHabits,
  saveStoredHabits,
  loadStoredTasks,
  saveStoredTasks,
  loadThemePreference,
  saveThemePreference,
  getInitialHabits,
  getInitialTasks,
} from '../services/storage';
import { getTodayDateString, calculateStreaks } from '../utils/dateUtils';
import { triggerHaptic } from '../utils/haptics';
import {
  areNotificationsEnabled,
  scheduleDailyReminders,
  cancelAllReminders,
} from '../services/notificationService';

export interface CelebrationState {
  visible: boolean;
  title: string;
  subtitle: string;
}

interface AppContextType {
  habits: Habit[];
  tasks: Task[];
  themeMode: ThemeMode;
  theme: ThemeColors;
  toggleTheme: () => void;
  celebration: CelebrationState;
  triggerCelebration: (title: string, subtitle: string) => void;
  dismissCelebration: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<boolean>;
  addHabit: (data: {
    title: string;
    category: HabitCategory;
    frequency: 'daily' | 'weekdays' | 'weekends';
    color: string;
    icon: string;
  }) => void;
  toggleHabitDate: (habitId: string, dateStr?: string) => void;
  deleteHabit: (habitId: string) => void;
  addTask: (data: {
    title: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: string;
  }) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  resetToDemoData: () => void;
  todayStats: {
    habitsTotal: number;
    habitsCompleted: number;
    tasksTotal: number;
    tasksCompleted: number;
    overallCompletionRate: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<CelebrationState>({
    visible: false,
    title: '',
    subtitle: '',
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const [storedHabits, storedTasks, savedTheme, notifStatus] = await Promise.all([
        loadStoredHabits(),
        loadStoredTasks(),
        loadThemePreference(),
        areNotificationsEnabled(),
      ]);
      setHabits(storedHabits);
      setTasks(storedTasks);
      setThemeMode(savedTheme);
      setNotificationsEnabled(notifStatus);
      setIsReady(true);
    }
    init();
  }, []);

  const theme = useMemo(() => (themeMode === 'dark' ? darkTheme : lightTheme), [themeMode]);

  const toggleTheme = () => {
    triggerHaptic('light');
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    saveThemePreference(next);
  };

  const triggerCelebration = (title: string, subtitle: string) => {
    setCelebration({
      visible: true,
      title,
      subtitle,
    });
  };

  const dismissCelebration = () => {
    setCelebration((prev) => ({ ...prev, visible: false }));
  };

  const toggleNotifications = async (): Promise<boolean> => {
    triggerHaptic('medium');
    if (notificationsEnabled) {
      await cancelAllReminders();
      setNotificationsEnabled(false);
      return false;
    } else {
      const success = await scheduleDailyReminders();
      if (success) {
        setNotificationsEnabled(true);
        triggerCelebration('Notifications Active 🔔', 'Daily reminders scheduled at 8:30 AM & 8:00 PM');
        return true;
      }
      return false;
    }
  };

  const addHabit = (data: {
    title: string;
    category: HabitCategory;
    frequency: 'daily' | 'weekdays' | 'weekends';
    color: string;
    icon: string;
  }) => {
    triggerHaptic('success');
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: data.title.trim(),
      category: data.category,
      frequency: data.frequency,
      color: data.color,
      icon: data.icon,
      createdAt: new Date().toISOString(),
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    saveStoredHabits(updated);
  };

  const toggleHabitDate = (habitId: string, dateStr?: string) => {
    const targetDate = dateStr || getTodayDateString();
    let justCompleted = false;
    let habitTitle = '';
    let updatedStreak = 0;

    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;

      habitTitle = h.title;
      const isCompleted = h.completedDates.includes(targetDate);
      justCompleted = !isCompleted;

      const newDates = isCompleted
        ? h.completedDates.filter((d) => d !== targetDate)
        : [...h.completedDates, targetDate];

      const { currentStreak, longestStreak } = calculateStreaks(newDates);
      updatedStreak = currentStreak;

      return {
        ...h,
        completedDates: newDates,
        currentStreak,
        longestStreak: Math.max(longestStreak, h.longestStreak),
      };
    });

    setHabits(updated);
    saveStoredHabits(updated);

    if (justCompleted) {
      triggerHaptic('success');
      triggerCelebration(
        'Habit Done! 🎉',
        `${habitTitle} • ${updatedStreak} Day Streak 🔥`
      );
    } else {
      triggerHaptic('light');
    }
  };

  const deleteHabit = (habitId: string) => {
    triggerHaptic('medium');
    const updated = habits.filter((h) => h.id !== habitId);
    setHabits(updated);
    saveStoredHabits(updated);
  };

  const addTask = (data: {
    title: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: string;
  }) => {
    triggerHaptic('success');
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title.trim(),
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const toggleTask = (taskId: string) => {
    let nowCompleted = false;
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const nextState = !t.completed;
      nowCompleted = nextState;
      return {
        ...t,
        completed: nextState,
        completedAt: nextState ? new Date().toISOString() : undefined,
      };
    });

    setTasks(updated);
    saveStoredTasks(updated);

    if (nowCompleted) {
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }
  };

  const deleteTask = (taskId: string) => {
    triggerHaptic('medium');
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const resetToDemoData = () => {
    triggerHaptic('medium');
    const defaultHabits = getInitialHabits();
    const defaultTasks = getInitialTasks();
    setHabits(defaultHabits);
    setTasks(defaultTasks);
    saveStoredHabits(defaultHabits);
    saveStoredTasks(defaultTasks);
  };

  const todayStats = useMemo(() => {
    const today = getTodayDateString();
    const habitsTotal = habits.length;
    const habitsCompleted = habits.filter((h) => h.completedDates.includes(today)).length;

    const todayTasks = tasks.filter((t) => !t.dueDate || t.dueDate <= today);
    const tasksTotal = todayTasks.length;
    const tasksCompleted = todayTasks.filter((t) => t.completed).length;

    const totalActions = habitsTotal + tasksTotal;
    const totalCompleted = habitsCompleted + tasksCompleted;
    const overallCompletionRate = totalActions > 0 ? Math.round((totalCompleted / totalActions) * 100) : 0;

    return {
      habitsTotal,
      habitsCompleted,
      tasksTotal,
      tasksCompleted,
      overallCompletionRate,
    };
  }, [habits, tasks]);

  return (
    <AppContext.Provider
      value={{
        habits,
        tasks,
        themeMode,
        theme,
        toggleTheme,
        celebration,
        triggerCelebration,
        dismissCelebration,
        notificationsEnabled,
        toggleNotifications,
        addHabit,
        toggleHabitDate,
        deleteHabit,
        addTask,
        toggleTask,
        deleteTask,
        resetToDemoData,
        todayStats,
      }}
    >
      {isReady ? children : null}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
