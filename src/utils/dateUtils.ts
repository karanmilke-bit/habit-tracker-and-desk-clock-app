export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const today = getTodayDateString();
  
  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrow = formatDateString(tomorrowDate);

  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const yesterday = formatDateString(yesterdayDate);

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function getPastDays(numDays = 7): { dateStr: string; dayLabel: string; dayNumber: number }[] {
  const days: { dateStr: string; dayLabel: string; dayNumber: number }[] = [];
  const today = new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDateString(d);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const dayNumber = d.getDate();
    days.push({ dateStr, dayLabel, dayNumber });
  }

  return days;
}

export function calculateStreaks(completedDates: string[]): { currentStreak: number; longestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueSorted = Array.from(new Set(completedDates)).sort().reverse();
  const todayStr = getTodayDateString();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDateString(yesterdayDate);

  // Check if active: either completed today or yesterday
  let currentStreak = 0;
  let checkDate = new Date();

  if (uniqueSorted.includes(todayStr)) {
    checkDate = new Date();
  } else if (uniqueSorted.includes(yesterdayStr)) {
    checkDate = new Date(yesterdayDate);
  } else {
    currentStreak = 0;
  }

  if (uniqueSorted.includes(todayStr) || uniqueSorted.includes(yesterdayStr)) {
    let cursor = new Date(checkDate);
    while (true) {
      const curStr = formatDateString(cursor);
      if (uniqueSorted.includes(curStr)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all recorded dates
  const ascending = Array.from(new Set(completedDates)).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of ascending) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffMs = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = currentDate;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, longestStreak),
  };
}
