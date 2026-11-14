import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { rad, useTheme } from './ui';

interface ToastState {
  id: number;
  message: string | null;
  undo?: () => void;
  show: (message: string, undo?: () => void) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  id: 0,
  message: null,
  show: (message, undo) => set((s) => ({ id: s.id + 1, message, undo })),
  hide: () => set({ message: null, undo: undefined }),
}));

/** Shows "Deleted · Undo" style messages above the bottom of the screen. */
export function ToastHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { id, message, undo, hide } = useToast();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, 5000);
    return () => clearTimeout(timer);
  }, [id, message, hide]);

  if (!message) return null;
  const inverse = t.dark ? '#F4F4F6' : '#15171A';
  const onInverse = t.dark ? '#15171A' : '#F4F4F6';
  return (
    <Animated.View
      key={id}
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + 90,
        backgroundColor: inverse,
        borderRadius: rad(t, 14),
        paddingLeft: 16,
        paddingRight: 6,
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}>
      <Text style={{ flex: 1, color: onInverse, fontFamily: t.fonts.medium, fontSize: 15 }}>{message}</Text>
      {undo && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            undo();
            hide();
          }}
          style={{ height: 44, paddingHorizontal: 14, justifyContent: 'center' }}>
          <Text style={{ color: onInverse, fontFamily: t.fonts.bold, fontSize: 15, textDecorationLine: 'underline' }}>Undo</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
