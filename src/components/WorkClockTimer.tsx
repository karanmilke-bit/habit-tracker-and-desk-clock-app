import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';

export type ClockMode = 'clock' | 'focus' | 'workout' | 'stopwatch';

export type ClockWallpaper = 'midnight' | 'sunset' | 'zen' | 'cyberpunk' | 'monochrome';

interface WallpaperStyle {
  id: ClockWallpaper;
  name: string;
  bg: string;
  cardBg: string;
  accent: string;
  textPrimary: string;
  textMuted: string;
  glowColor: string;
}

interface StopwatchLap {
  id: number;
  splitTime: number;   // total cumulative ms
  lapDuration: number; // ms for this individual lap
}

const WALLPAPERS: Record<ClockWallpaper, WallpaperStyle> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight OLED',
    bg: '#000000',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    accent: '#38BDF8', // Light Blue
    textPrimary: '#FFFFFF',
    textMuted: '#64748B',
    glowColor: 'rgba(56, 189, 248, 0.25)',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Dusk',
    bg: '#1A0B2E',
    cardBg: 'rgba(244, 63, 94, 0.1)',
    accent: '#FB7185', // Coral Rose
    textPrimary: '#FFF1F2',
    textMuted: '#FDA4AF88',
    glowColor: 'rgba(251, 113, 133, 0.3)',
  },
  zen: {
    id: 'zen',
    name: 'Emerald Zen',
    bg: '#041B15',
    cardBg: 'rgba(16, 185, 129, 0.08)',
    accent: '#34D399', // Mint Emerald
    textPrimary: '#ECFDF5',
    textMuted: '#6EE7B788',
    glowColor: 'rgba(52, 211, 153, 0.25)',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bg: '#090919',
    cardBg: 'rgba(236, 72, 153, 0.12)',
    accent: '#F43F5E', // Neon Pink
    textPrimary: '#38BDF8', // Cyan
    textMuted: '#818CF8',
    glowColor: 'rgba(244, 63, 94, 0.35)',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Amber Retro',
    bg: '#121316',
    cardBg: 'rgba(245, 158, 11, 0.08)',
    accent: '#F59E0B', // Amber
    textPrimary: '#FEF3C7',
    textMuted: '#D9770688',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
};

export const WorkClockTimer: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isPhysicalLandscape = width > height;

  const [mode, setMode] = useState<ClockMode>('clock');
  const [wallpaperId, setWallpaperId] = useState<ClockWallpaper>('midnight');
  const [manualForceLandscape, setManualForceLandscape] = useState(false);
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);

  // When device is tilted sideways (width > height) OR user tapped manual toggle
  const isHorizontal = isPhysicalLandscape || manualForceLandscape;

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Focus Timer (Pomodoro) State: Default 25 min (1500 sec)
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(25 * 60);
  const [focusInitialDuration] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  // Workout Interval Timer State
  const [workoutRound, setWorkoutRound] = useState(1);
  const [workoutTotalRounds] = useState(5);
  const [workoutPhase, setWorkoutPhase] = useState<'work' | 'rest'>('work');
  const [workoutSecondsLeft, setWorkoutSecondsLeft] = useState(40);
  const [workoutWorkDuration] = useState(40);
  const [workoutRestDuration] = useState(20);
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);

  // Stopwatch State with Lap Support
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<StopwatchLap[]>([]);

  const wp = WALLPAPERS[wallpaperId];

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isFocusRunning && focusSecondsLeft > 0) {
      interval = setInterval(() => {
        setFocusSecondsLeft((prev) => {
          if (prev <= 1) {
            triggerHaptic('success');
            setIsFocusRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusSecondsLeft]);

  // Workout Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isWorkoutRunning && workoutSecondsLeft > 0) {
      interval = setInterval(() => {
        setWorkoutSecondsLeft((prev) => {
          // Haptic countdown on 3, 2, 1
          if (prev <= 4 && prev > 1) {
            triggerHaptic('light');
          }
          if (prev <= 1) {
            triggerHaptic('heavy');
            // Transition between Work and Rest
            if (workoutPhase === 'work') {
              setWorkoutPhase('rest');
              return workoutRestDuration;
            } else {
              if (workoutRound < workoutTotalRounds) {
                setWorkoutRound((r) => r + 1);
                setWorkoutPhase('work');
                return workoutWorkDuration;
              } else {
                // Workout completed!
                setIsWorkoutRunning(false);
                triggerHaptic('success');
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutRunning, workoutSecondsLeft, workoutPhase, workoutRound, workoutTotalRounds, workoutRestDuration, workoutWorkDuration]);

  // Stopwatch Effect
  useEffect(() => {
    let interval: any = null;
    if (isStopwatchRunning) {
      const start = Date.now() - stopwatchMs;
      interval = setInterval(() => {
        setStopwatchMs(Date.now() - start);
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const toggleFocus = () => {
    triggerHaptic('medium');
    setIsFocusRunning(!isFocusRunning);
  };

  const resetFocus = () => {
    triggerHaptic('light');
    setIsFocusRunning(false);
    setFocusSecondsLeft(focusInitialDuration);
  };

  const toggleWorkout = () => {
    triggerHaptic('medium');
    setIsWorkoutRunning(!isWorkoutRunning);
  };

  const resetWorkout = () => {
    triggerHaptic('light');
    setIsWorkoutRunning(false);
    setWorkoutRound(1);
    setWorkoutPhase('work');
    setWorkoutSecondsLeft(workoutWorkDuration);
  };

  // Stopwatch Handlers with Lap Tracking
  const toggleStopwatch = () => {
    triggerHaptic('medium');
    setIsStopwatchRunning(!isStopwatchRunning);
  };

  const recordLap = () => {
    if (!isStopwatchRunning || stopwatchMs === 0) return;
    triggerHaptic('medium');
    const prevSplit = laps.length > 0 ? laps[0].splitTime : 0;
    const lapDuration = stopwatchMs - prevSplit;
    const newLap: StopwatchLap = {
      id: laps.length + 1,
      splitTime: stopwatchMs,
      lapDuration: lapDuration > 0 ? lapDuration : stopwatchMs,
    };
    setLaps([newLap, ...laps]);
  };

  const resetStopwatch = () => {
    triggerHaptic('light');
    setIsStopwatchRunning(false);
    setStopwatchMs(0);
    setLaps([]);
  };

  // Fastest & Slowest Lap calculation
  const fastestLapDuration =
    laps.length >= 2 ? Math.min(...laps.map((l) => l.lapDuration)) : -1;
  const slowestLapDuration =
    laps.length >= 2 ? Math.max(...laps.map((l) => l.lapDuration)) : -1;

  // Formatters
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const dateString = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: wp.bg },
        isHorizontal && styles.horizontalContainer,
      ]}
    >
      {/* Top Controls Bar */}
      <View style={styles.topControlRow}>
        {/* Mode Selector */}
        <View style={[styles.modeSelector, { backgroundColor: wp.cardBg }]}>
          {(['clock', 'focus', 'workout', 'stopwatch'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeBtn,
                mode === m && { backgroundColor: wp.accent },
              ]}
              onPress={() => {
                triggerHaptic('light');
                setMode(m);
              }}
            >
              <Text
                style={[
                  styles.modeText,
                  { color: mode === m ? '#FFFFFF' : wp.textMuted },
                ]}
              >
                {m.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action icons */}
        <View style={styles.iconActions}>
          {/* Wallpaper Toggle */}
          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: wp.cardBg }]}
            onPress={() => setShowWallpaperMenu(!showWallpaperMenu)}
            accessibilityLabel="Switch Theme Wallpaper"
          >
            <Ionicons name="color-palette-outline" size={18} color={wp.accent} />
          </TouchableOpacity>

          {/* Horizontal / Landscape toggle button */}
          <TouchableOpacity
            style={[
              styles.actionIconBtn,
              { backgroundColor: isHorizontal ? wp.accent : wp.cardBg },
            ]}
            onPress={() => {
              triggerHaptic('medium');
              setManualForceLandscape(!manualForceLandscape);
            }}
            accessibilityLabel={isHorizontal ? 'Switch to Portrait' : 'Switch to Horizontal'}
          >
            <Ionicons
              name={isHorizontal ? 'phone-portrait-outline' : 'phone-landscape-outline'}
              size={18}
              color={isHorizontal ? '#FFFFFF' : wp.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallpaper Picker Dropdown */}
      {showWallpaperMenu && (
        <View style={[styles.wallpaperMenu, { backgroundColor: '#181E29', borderColor: wp.accent }]}>
          {Object.values(WALLPAPERS).map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.wallpaperOption,
                wallpaperId === w.id && { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              ]}
              onPress={() => {
                setWallpaperId(w.id);
                setShowWallpaperMenu(false);
                triggerHaptic('selection');
              }}
            >
              <View style={[styles.colorDot, { backgroundColor: w.accent }]} />
              <Text style={[styles.wallpaperName, { color: '#FFFFFF' }]}>{w.name}</Text>
              {wallpaperId === w.id && (
                <Ionicons name="checkmark" size={16} color={w.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Display Area */}
      <View style={[styles.displayArea, isHorizontal && styles.displayAreaHorizontal]}>
        {/* Clock Mode */}
        {mode === 'clock' && (
          <View style={styles.clockCenter}>
            <Text style={[styles.dateText, { color: wp.accent }]}>{dateString.toUpperCase()}</Text>
            <View style={styles.timeRow}>
              <Text
                style={[
                  styles.digit,
                  { color: wp.textPrimary },
                  isHorizontal && styles.digitHorizontal,
                ]}
              >
                {hours}:{minutes}
              </Text>
              <Text style={[styles.secondDigit, { color: wp.accent }]}>{seconds}</Text>
            </View>
            <Text style={[styles.subLabel, { color: wp.textMuted }]}>WORK & FOCUS CLOCK</Text>
          </View>
        )}

        {/* Focus / Pomodoro Mode */}
        {mode === 'focus' && (
          <View style={styles.clockCenter}>
            <Text style={[styles.statusTag, { color: wp.accent }]}>
              {isFocusRunning ? '🎯 FOCUS SESSION' : 'PAUSED'}
            </Text>
            <Text
              style={[
                styles.digit,
                { color: wp.textPrimary },
                isHorizontal && styles.digitHorizontal,
              ]}
            >
              {formatTimer(focusSecondsLeft)}
            </Text>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.timerMainBtn, { backgroundColor: wp.accent }]}
                onPress={toggleFocus}
              >
                <Ionicons
                  name={isFocusRunning ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.btnLabel}>{isFocusRunning ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timerSecondaryBtn, { backgroundColor: wp.cardBg }]}
                onPress={resetFocus}
              >
                <Ionicons name="refresh" size={20} color={wp.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Workout Interval Mode */}
        {mode === 'workout' && (
          <View style={styles.clockCenter}>
            <View style={styles.workoutHeader}>
              <View
                style={[
                  styles.phaseBadge,
                  {
                    backgroundColor:
                      workoutPhase === 'work' ? `${wp.accent}33` : 'rgba(16, 185, 129, 0.2)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.phaseText,
                    { color: workoutPhase === 'work' ? wp.accent : '#34D399' },
                  ]}
                >
                  {workoutPhase === 'work' ? '🔥 WORK INTERVAL' : '💨 REST & BREATHE'}
                </Text>
              </View>
              <Text style={[styles.roundText, { color: wp.textMuted }]}>
                Round {workoutRound} of {workoutTotalRounds}
              </Text>
            </View>

            <Text
              style={[
                styles.digit,
                { color: workoutPhase === 'work' ? wp.textPrimary : '#34D399' },
                isHorizontal && styles.digitHorizontal,
              ]}
            >
              {formatTimer(workoutSecondsLeft)}
            </Text>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[
                  styles.timerMainBtn,
                  { backgroundColor: workoutPhase === 'work' ? wp.accent : '#10B981' },
                ]}
                onPress={toggleWorkout}
              >
                <Ionicons
                  name={isWorkoutRunning ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.btnLabel}>{isWorkoutRunning ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timerSecondaryBtn, { backgroundColor: wp.cardBg }]}
                onPress={resetWorkout}
              >
                <Ionicons name="refresh" size={20} color={wp.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stopwatch Mode with Laps */}
        {mode === 'stopwatch' && (
          <View style={[styles.clockCenter, styles.stopwatchContainer]}>
            <Text style={[styles.statusTag, { color: wp.accent }]}>CHRONOGRAPH</Text>
            <Text
              style={[
                styles.digit,
                styles.stopwatchDigit,
                { color: wp.textPrimary },
                isHorizontal && styles.digitHorizontal,
              ]}
            >
              {formatStopwatch(stopwatchMs)}
            </Text>

            {/* Controls Row: Start/Pause + Lap/Reset */}
            <View style={styles.controlsRow}>
              {/* Primary Play/Pause/Resume */}
              <TouchableOpacity
                style={[styles.timerMainBtn, { backgroundColor: wp.accent }]}
                onPress={toggleStopwatch}
              >
                <Ionicons
                  name={isStopwatchRunning ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.btnLabel}>
                  {isStopwatchRunning ? 'Pause' : stopwatchMs > 0 ? 'Resume' : 'Start'}
                </Text>
              </TouchableOpacity>

              {/* Secondary Button: LAP when running, RESET when stopped */}
              {isStopwatchRunning ? (
                <TouchableOpacity
                  style={[
                    styles.lapActionBtn,
                    { backgroundColor: wp.cardBg, borderColor: wp.accent },
                  ]}
                  onPress={recordLap}
                  accessibilityLabel="Record Lap"
                >
                  <Ionicons name="flag-outline" size={18} color={wp.accent} />
                  <Text style={[styles.lapActionText, { color: wp.accent }]}>Lap</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.timerSecondaryBtn,
                    { backgroundColor: wp.cardBg, opacity: stopwatchMs > 0 ? 1 : 0.4 },
                  ]}
                  onPress={resetStopwatch}
                  disabled={stopwatchMs === 0}
                  accessibilityLabel="Reset Stopwatch"
                >
                  <Ionicons name="refresh" size={20} color={wp.textPrimary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Lap History List */}
            {laps.length > 0 && (
              <View
                style={[
                  styles.lapListContainer,
                  {
                    backgroundColor: wp.cardBg,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    maxHeight: isHorizontal ? 120 : 200,
                  },
                ]}
              >
                <View style={styles.lapListHeader}>
                  <Text style={[styles.lapHeaderLabel, { color: wp.textMuted }]}>LAP</Text>
                  <Text style={[styles.lapHeaderLabel, { color: wp.textMuted, textAlign: 'center' }]}>
                    LAP TIME
                  </Text>
                  <Text style={[styles.lapHeaderLabel, { color: wp.textMuted, textAlign: 'right' }]}>
                    SPLIT
                  </Text>
                </View>

                <ScrollView
                  style={styles.lapScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {laps.map((lap) => {
                    const isFastest = laps.length >= 2 && lap.lapDuration === fastestLapDuration;
                    const isSlowest = laps.length >= 2 && lap.lapDuration === slowestLapDuration;
                    const rowColor = isFastest ? '#34D399' : isSlowest ? '#F87171' : wp.textPrimary;

                    return (
                      <View
                        key={lap.id}
                        style={[
                          styles.lapRow,
                          isFastest && styles.lapRowFastest,
                          isSlowest && styles.lapRowSlowest,
                        ]}
                      >
                        <View style={styles.lapColLeft}>
                          <Text style={[styles.lapNumText, { color: rowColor }]}>
                            Lap {lap.id}
                          </Text>
                          {isFastest && <Text style={styles.fastestTag}>Fastest</Text>}
                          {isSlowest && <Text style={styles.slowestTag}>Slowest</Text>}
                        </View>

                        <Text style={[styles.lapDurationText, { color: rowColor }]}>
                          {formatStopwatch(lap.lapDuration)}
                        </Text>

                        <Text style={[styles.lapSplitText, { color: wp.textMuted }]}>
                          {formatStopwatch(lap.splitTime)}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  horizontalContainer: {
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallpaperMenu: {
    position: 'absolute',
    top: 58,
    right: 16,
    borderRadius: 16,
    padding: 8,
    zIndex: 100,
    borderWidth: 1,
    minWidth: 190,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  wallpaperOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  wallpaperName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  displayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  displayAreaHorizontal: {
    paddingVertical: 8,
  },
  clockCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stopwatchContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 68,
    fontWeight: '800',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  digitHorizontal: {
    fontSize: 88,
  },
  stopwatchDigit: {
    fontSize: 52,
  },
  secondDigit: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 6,
    marginTop: 10,
  },
  subLabel: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
    marginTop: 12,
  },
  statusTag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  workoutHeader: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  phaseBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phaseText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roundText: {
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
    marginBottom: 14,
  },
  timerMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  btnLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  timerSecondaryBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 6,
  },
  lapActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  lapListContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
  },
  lapListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  lapHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  lapScrollView: {
    marginTop: 4,
  },
  lapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  lapRowFastest: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 8,
  },
  lapRowSlowest: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: 8,
  },
  lapColLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lapNumText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  fastestTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34D399',
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  slowestTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F87171',
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lapDurationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  lapSplitText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
