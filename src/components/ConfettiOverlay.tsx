import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';

interface ConfettiOverlayProps {
  visible: boolean;
  title: string;
  subtitle: string;
  onDismiss: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#FBBF24', // Gold
];

const NUM_PARTICLES = 36;

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
  visible,
  title,
  subtitle,
  onDismiss,
}) => {
  const [active, setActive] = useState(false);
  const fallAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.5)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  // Particle positions
  const particles = useRef(
    Array.from({ length: NUM_PARTICLES }, () => ({
      startX: Math.random() * SCREEN_WIDTH,
      driftX: (Math.random() - 0.5) * 160,
      size: Math.random() * 8 + 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 300,
      rotateZ: Math.random() * 720 - 360,
      isCircle: Math.random() > 0.5,
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      setActive(true);
      triggerHaptic('success');
      fallAnim.setValue(0);
      badgeScale.setValue(0.5);
      badgeOpacity.setValue(0);

      // Animate badge entrance
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 2.4s
      const timer = setTimeout(() => {
        Animated.timing(badgeOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setActive(false);
          onDismiss();
        });
      }, 2400);

      return () => clearTimeout(timer);
    } else {
      setActive(false);
    }
  }, [visible]);

  if (!active && !visible) return null;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onDismiss}
      style={styles.overlay}
    >
      {/* Falling Confetti Particles */}
      {particles.map((p, i) => {
        const translateY = fallAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, SCREEN_HEIGHT + 60],
        });

        const translateX = fallAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [p.startX, p.startX + p.driftX * 0.5, p.startX + p.driftX],
        });

        const rotate = fallAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.rotateZ}deg`],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.isCircle ? p.size : p.size * 1.6,
                borderRadius: p.isCircle ? p.size / 2 : 2,
                backgroundColor: p.color,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}

      {/* Celebration Popup Badge */}
      <Animated.View
        style={[
          styles.badgeContainer,
          {
            opacity: badgeOpacity,
            transform: [{ scale: badgeScale }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles" size={28} color="#F59E0B" />
        </View>
        <Text style={styles.badgeTitle}>{title}</Text>
        <Text style={styles.badgeSubtitle}>{subtitle}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  badgeContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: 320,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  badgeSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});
