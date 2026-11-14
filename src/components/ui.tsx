import { type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useStore } from '@/lib/store';
import { getTheme, type AppTheme } from '@/lib/themes';

import { Icon, type IconName } from './icons';

export function useTheme(): AppTheme {
  const id = useStore((s) => s.settings.themeId);
  return getTheme(id);
}

export const rad = (t: AppTheme, n: number) => Math.max(2, Math.round(n * t.radius));
export const btnRad = (t: AppTheme, n: number) => (t.pill ? 999 : rad(t, n));

type Variant = 'display' | 'h1' | 'h2' | 'title' | 'body' | 'bodyStrong' | 'small' | 'label' | 'num' | 'bigNum';

export function T({
  v = 'body',
  color,
  style,
  children,
  numberOfLines,
  center,
}: {
  v?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
  center?: boolean;
}) {
  const t = useTheme();
  const f = t.fonts;
  const base: TextStyle = (() => {
    switch (v) {
      case 'display':
        return { fontFamily: f.display, fontSize: 34, lineHeight: 40, textTransform: t.upper && t.id !== 'lash' ? 'uppercase' : 'none' };
      case 'h1':
        return { fontFamily: f.heading, fontSize: 28, lineHeight: 34, textTransform: t.upper ? 'uppercase' : 'none' };
      case 'h2':
        return { fontFamily: f.heading, fontSize: 18, lineHeight: 24, textTransform: t.upper ? 'uppercase' : 'none', letterSpacing: t.upper ? 0.5 : 0 };
      case 'title':
        return { fontFamily: f.semibold, fontSize: 16, lineHeight: 21 };
      case 'bodyStrong':
        return { fontFamily: f.semibold, fontSize: 15, lineHeight: 21 };
      case 'small':
        return { fontFamily: f.regular, fontSize: 13, lineHeight: 18, color: t.c.muted };
      case 'label':
        return { fontFamily: f.semibold, fontSize: 12, letterSpacing: 0.7, textTransform: 'uppercase', color: t.c.muted };
      case 'num':
        return { fontFamily: f.heading, fontSize: 20, fontVariant: ['tabular-nums'] };
      case 'bigNum':
        return { fontFamily: f.heading, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] };
      default:
        return { fontFamily: f.regular, fontSize: 15, lineHeight: 21 };
    }
  })();
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: t.c.text }, base, center && { textAlign: 'center' }, color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  contentStyle,
  footer,
  header,
  bg,
}: {
  children: ReactNode;
  header?: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  bg?: string;
}) {
  const t = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg ?? t.c.bg }}>
      {header}
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ padding: 20, paddingBottom: 40, gap: 16 }, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

export function Card({ children, style, tint, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; tint?: boolean; onPress?: () => void; accessibilityLabel?: string }) {
  const t = useTheme();
  const s: ViewStyle = {
    backgroundColor: tint ? t.c.tint : t.c.surface,
    borderRadius: rad(t, 16),
    padding: 16,
    borderWidth: tint || t.cardBorder ? 1 : 0,
    borderColor: tint ? t.c.tintBorder : t.c.border,
  };
  if (onPress)
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [s, { opacity: pressed ? 0.85 : 1 }, style]}>
        {children}
      </Pressable>
    );
  return <View style={[s, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const t = useTheme();
  const bg = kind === 'primary' ? t.c.accent : kind === 'secondary' ? t.c.surface2 : 'transparent';
  const fg =
    kind === 'primary' ? t.c.onAccent : kind === 'outline' ? (t.dark ? t.c.accent : t.c.text) : kind === 'danger' ? t.c.danger : kind === 'ghost' ? t.c.muted : t.c.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: small ? 44 : 54,
          borderRadius: btnRad(t, 14),
          backgroundColor: bg,
          borderWidth: kind === 'outline' ? 1.5 : kind === 'danger' ? 1 : 0,
          borderColor: kind === 'outline' ? (t.dark ? t.c.accent : t.c.text) : t.c.danger,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: 16,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}>
      {icon && <Icon name={icon} size={18} color={fg} strokeWidth={2.4} />}
      <Text style={{ color: fg, fontFamily: t.fonts.bold, fontSize: small ? 14 : 16, textTransform: t.upper ? 'uppercase' : 'none', letterSpacing: t.upper ? 0.4 : 0 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, color, bg, size = 44 }: { icon: IconName; onPress: () => void; label: string; color?: string; bg?: string; size?: number }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: btnRad(t, 12), backgroundColor: bg ?? 'transparent', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Icon name={icon} size={20} color={color ?? t.c.text} />
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 19,
        backgroundColor: selected ? t.c.accent : 'transparent',
        borderWidth: selected ? 0 : 1,
        borderColor: t.c.border,
        justifyContent: 'center',
      }}>
      <Text style={{ color: selected ? t.c.onAccent : t.c.text, fontFamily: selected ? t.fonts.semibold : t.fonts.medium, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  const t = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: t.c.surface, borderRadius: rad(t, 12), padding: 4, gap: 4, borderWidth: t.cardBorder ? 1 : 0, borderColor: t.c.border }}>
      {options.map((o) => {
        const sel = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: sel }}
            onPress={() => onChange(o.key)}
            style={{ flex: 1, height: 40, borderRadius: rad(t, 9), alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? t.c.surface2 : 'transparent' }}>
            <Text style={{ color: sel ? t.c.text : t.c.muted, fontFamily: sel ? t.fonts.semibold : t.fonts.medium, fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {label ? <T v="label">{label}</T> : null}
      <TextInput
        placeholderTextColor={t.c.muted}
        accessibilityLabel={label}
        {...props}
        style={[
          {
            height: 52,
            borderRadius: rad(t, 12),
            borderWidth: 1,
            borderColor: t.c.border,
            backgroundColor: t.c.surface,
            color: t.c.text,
            paddingHorizontal: 14,
            fontFamily: t.fonts.medium,
            fontSize: 16,
          },
          style,
        ]}
      />
    </View>
  );
}

export function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.c.border }}>
      {onBack ? <IconButton icon="chevronLeft" label="Back" onPress={onBack} /> : <View style={{ width: 12 }} />}
      <T v="h2" style={{ flex: 1, fontSize: 20 }} numberOfLines={1}>
        {title}
      </T>
      {right}
    </View>
  );
}

export function Row({ children, style, gap = 12 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Stat({ label, value, tint }: { label: string; value: string; tint?: boolean }) {
  const t = useTheme();
  return (
    <Card tint={tint} style={{ flex: 1, padding: 14, gap: 4 }}>
      <T v="small" color={tint ? t.c.tintText : undefined}>
        {label}
      </T>
      <T v="num" color={tint ? (t.dark ? t.c.accent : t.c.text) : undefined}>
        {value}
      </T>
    </Card>
  );
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  const t = useTheme();
  return (
    <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
      <Icon name={icon} size={28} color={t.c.muted} />
      <T v="title" center>
        {title}
      </T>
      <T v="small" center style={{ maxWidth: 280 }}>
        {text}
      </T>
      {action}
    </Card>
  );
}
