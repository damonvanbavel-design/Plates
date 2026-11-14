import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Mask, Path, Pattern, Rect, Stop } from 'react-native-svg';

import { useTheme } from './ui';

/** Themed top band for the Home screen, with each theme's signature motif. */
export function Hero({ kicker, title, right }: { kicker: string; title: string; right?: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const banded = t.c.band !== t.c.bg;
  const center = t.id === 'halftone';
  const size = t.id === 'sunny' ? 34 : t.id === 'crimson' || t.id === 'lash' ? 50 : t.id === 'chalk' ? 46 : 38;
  return (
    <View style={{ backgroundColor: t.c.band, paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: t.motif === 'tape' ? 48 : banded || t.motif === 'dots' ? 24 : 4, overflow: 'hidden' }}>
      {t.motif === 'stack' && (
        <View pointerEvents="none" style={{ position: 'absolute', left: -6, top: insets.top }}>
          {[0, 1, 2, 3].map((i) => (
            <Text key={i} style={{ fontFamily: t.fonts.display, fontSize: 46, lineHeight: 44, color: '#1D6AC6' }} numberOfLines={1}>
              TRAIN TRAIN TRAIN
            </Text>
          ))}
        </View>
      )}
      {t.motif === 'dots' && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 }}>
          <Svg width="100%" height="120">
            <Defs>
              <Pattern id="dots" width={6} height={6} patternUnits="userSpaceOnUse">
                <Circle cx={3} cy={3} r={1.5} fill={t.c.accent} />
              </Pattern>
              <LinearGradient id="fade" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0.1" stopColor="#fff" stopOpacity={1} />
                <Stop offset="1" stopColor="#fff" stopOpacity={0} />
              </LinearGradient>
              <Mask id="m">
                <Rect width="100%" height="120" fill="url(#fade)" />
              </Mask>
            </Defs>
            <Rect width="100%" height="120" fill="url(#dots)" mask="url(#m)" opacity={0.85} />
          </Svg>
        </View>
      )}
      {t.motif === 'tape' && (
        <View pointerEvents="none" style={{ position: 'absolute', left: -40, right: -40, bottom: 10, transform: [{ rotate: '-4deg' }] }}>
          <View style={{ height: 24, backgroundColor: '#1F0A16', borderTopWidth: 3, borderBottomWidth: 3, borderStyle: 'dashed', borderColor: t.c.bg, justifyContent: 'center', overflow: 'hidden' }}>
            <Text numberOfLines={1} style={{ color: t.c.bg, fontFamily: t.fonts.bold, fontSize: 10, letterSpacing: 2 }}>
              {'   STAY STRONG · LIFT HEAVY · STAY STRONG · LIFT HEAVY · STAY STRONG · LIFT HEAVY'}
            </Text>
          </View>
        </View>
      )}
      {t.motif === 'sparkle' && (
        <View pointerEvents="none" style={{ position: 'absolute', right: 80, top: insets.top + 22 }}>
          <Svg width={26} height={26} viewBox="0 0 24 24">
            <Path d="M12 1c.8 5.6 3.4 8.2 11 11-7.6 2.8-10.2 5.4-11 11-.8-5.6-3.4-8.2-11-11 7.6-2.8 10.2-5.4 11-11z" fill={t.c.accent} />
          </Svg>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
        <Text style={{ fontFamily: t.fonts.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: t.c.bandMuted }}>{kicker}</Text>
        {right}
      </View>
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: t.fonts.display,
          fontSize: size,
          lineHeight: size * 1.12,
          color: t.c.bandText,
          textTransform: t.upper && t.id !== 'lash' ? 'uppercase' : 'none',
          textAlign: center ? 'center' : 'left',
          marginTop: 6,
        }}>
        {title}
      </Text>
    </View>
  );
}
