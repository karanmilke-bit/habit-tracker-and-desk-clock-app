import { ThemeColors } from '../types';

export const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  primary: '#6366F1', // Indigo
  primaryLight: '#EEF2FF',
  secondary: '#EC4899', // Pink
  accent: '#8B5CF6', // Purple
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Rose
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
};

export const darkTheme: ThemeColors = {
  background: '#0B0F19',
  surface: '#111827',
  surfaceElevated: '#1F2937',
  card: '#151C2C',
  cardBorder: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#818CF8', // Soft Indigo
  primaryLight: '#1E1B4B',
  secondary: '#F472B6', // Soft Pink
  accent: '#A78BFA', // Soft Purple
  success: '#34D399', // Mint
  warning: '#FBBF24', // Amber
  danger: '#F87171', // Soft Red
  border: '#1E293B',
  inputBg: '#1E293B',
};

export const CATEGORY_COLORS: Record<string, string> = {
  Health: '#10B981',
  Fitness: '#F97316',
  Productivity: '#6366F1',
  Learning: '#8B5CF6',
  Mindfulness: '#06B6D4',
  Personal: '#EC4899',
  Work: '#3B82F6',
  Study: '#A855F7',
  Shopping: '#EAB308',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Health: 'heart',
  Fitness: 'barbell',
  Productivity: 'flash',
  Learning: 'book',
  Mindfulness: 'leaf',
  Personal: 'person',
  Work: 'briefcase',
  Study: 'school',
  Shopping: 'cart',
};
