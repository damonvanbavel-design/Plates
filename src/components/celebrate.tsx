import { useEffect, useState } from 'react';
import { Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { useTheme } from './ui';

/** Counts a number up from 0 when it first appears. */
export function CountUp({ value, format, style }: { value: number; format: (v: number) => string; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const start = Date.now();
    const dur = 900;
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return <Text style={style}>{format(reduced ? value : shown)}</Text>;
}

const PIECES = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * Math.PI * 2 + (i % 3) * 0.2,
  dist: 70 + (i % 4) * 26,
  size: 6 + (i % 3) * 3,
  delay: (i % 5) * 40,
  round: i % 2 === 0,
}));

/** A short burst of confetti from the centre, for new personal records. */
export function Burst() {
  const t = useTheme();
  const reduced = useReducedMotion();
  if (reduced) return null;
  const colors = [t.c.accent, t.c.text, t.c.tintBorder];
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: 48, width: 0, height: 0 }}>
      {PIECES.map((p, i) => (
        <Piece key={i} {...p} color={colors[i % colors.length]!} />
      ))}
    </View>
  );
}

function Piece({
  angle,
  dist,
  size,
  delay,
  round,
  color,
}: {
  angle: number;
  dist: number;
  size: number;
  delay: number;
  round: boolean;
  color: string;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withDelay(delay + 200, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })));
  }, [p, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value < 0.7 ? 1 : 1 - (p.value - 0.7) / 0.3,
    transform: [
      { translateX: Math.cos(angle) * dist * p.value },
      { translateY: Math.sin(angle) * dist * p.value + 40 * p.value * p.value },
      { rotate: `${p.value * 360}deg` },
      { scale: p.value === 0 ? 0 : 1 },
    ],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', width: size, height: round ? size : size * 1.8, borderRadius: round ? size / 2 : 2, backgroundColor: color },
        style,
      ]}
    />
  );
}
