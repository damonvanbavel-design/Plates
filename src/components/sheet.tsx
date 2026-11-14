import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './icons';
import { T, rad, useTheme } from './ui';

/** Bottom sheet used for dropdowns, quick choices and small forms. */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View entering={FadeIn.duration(180)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable accessibilityLabel="Close" style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(220)}
          style={{
            backgroundColor: t.c.surface,
            borderTopLeftRadius: rad(t, 22),
            borderTopRightRadius: rad(t, 22),
            paddingBottom: insets.bottom + 12,
            maxHeight: '80%',
          }}>
          <View style={{ alignItems: 'center', paddingTop: 8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.c.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
            <T v="h2" style={{ flex: 1 }}>
              {title}
            </T>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={10}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" color={t.c.muted} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 4 }}>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** A selectable row inside a Sheet. */
export function SheetOption({ label, detail, selected, onPress }: { label: string; detail?: string; selected?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: rad(t, 12),
        backgroundColor: selected ? t.c.tint : pressed ? t.c.surface2 : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      })}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.c.text, fontFamily: selected ? t.fonts.semibold : t.fonts.medium, fontSize: 16 }}>{label}</Text>
        {detail ? <Text style={{ color: selected ? t.c.tintText : t.c.muted, fontFamily: t.fonts.regular, fontSize: 13 }}>{detail}</Text> : null}
      </View>
      {selected && <Icon name="check" size={18} color={t.dark ? t.c.accent : t.c.text} strokeWidth={2.6} />}
    </Pressable>
  );
}
