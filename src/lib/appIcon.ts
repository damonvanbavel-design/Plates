/**
 * Home-screen icon that follows the theme (Android APK only).
 * The switch happens when the app goes to the background, because some
 * launchers restart an app whose launcher entry changes while it's open.
 */
import { requireOptionalNativeModule } from 'expo';
import { AppState, Platform } from 'react-native';

type PlatesIcon = { getIcon(): string | null; setIcon(id: string): boolean };

const Native = Platform.OS === 'android' ? requireOptionalNativeModule<PlatesIcon>('PlatesIcon') : null;

export const appIconSupported = !!Native;

let pending: string | null = null;

AppState.addEventListener('change', (state) => {
  if (state !== 'background' || !pending || !Native) return;
  const want = pending;
  pending = null;
  try {
    if (Native.getIcon() !== want) Native.setIcon(want);
  } catch {
    // ignore: icon stays as it was
  }
});

/** Ask for this icon; it is applied next time the app is in the background. */
export function requestAppIcon(id: string) {
  if (!Native) return;
  try {
    pending = Native.getIcon() === id ? null : id;
  } catch {
    pending = id;
  }
}
