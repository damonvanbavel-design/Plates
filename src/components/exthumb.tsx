import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { THUMBS } from '@/data/thumbs';
import { initials } from '@/lib/calc';
import { getExercise } from '@/lib/registry';

import { rad, useTheme } from './ui';

/** Small exercise picture (bundled, works offline), or initials for custom exercises. */
export function ExThumb({ exerciseId, size = 44, selected }: { exerciseId: string; size?: number; selected?: boolean }) {
  const t = useTheme();
  const ex = getExercise(exerciseId);
  const src = ex?.src ? THUMBS[ex.src] : undefined;
  const r = rad(t, Math.round(size / 4));
  if (src)
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: r,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderWidth: selected ? 2 : 0,
          borderColor: t.c.accent,
        }}>
        <Image source={src} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityIgnoresInvertColors transition={150} />
      </View>
    );
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: r,
        backgroundColor: selected ? t.c.tint : t.c.surface2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontFamily: t.fonts.heading, fontSize: size * 0.3, color: selected ? (t.dark ? t.c.accent : t.c.text) : t.c.muted }}>
        {initials(ex?.name ?? '?')}
      </Text>
    </View>
  );
}
