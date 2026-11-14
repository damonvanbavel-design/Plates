/**
 * Rest-timer notifications: when you tick a set, a local notification is
 * scheduled for the end of the rest so you hear/feel it with the phone locked.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL = 'rest-timer';
let scheduledId: string | null = null;
let ready: Promise<boolean> | null = null;

Notifications.setNotificationHandler({
  // In the app the on-screen timer already buzzes, so don't double up with a banner.
  handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

function setup(): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(false);
  ready ??= (async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL, {
          name: 'Rest timer',
          // eslint-disable-next-line import/namespace
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 300, 150, 300],
          sound: 'default',
        });
      }
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) return true;
      if (!current.canAskAgain) return false;
      const asked = await Notifications.requestPermissionsAsync();
      return asked.granted;
    } catch {
      return false;
    }
  })();
  return ready;
}

export async function scheduleRestDone(endsAt: number, exerciseName?: string) {
  await cancelRestDone();
  const seconds = Math.round((endsAt - Date.now()) / 1000);
  if (seconds < 3 || !(await setup())) return;
  try {
    scheduledId = await Notifications.scheduleNotificationAsync({
      content: { title: 'Rest is over', body: exerciseName ? `Next set of ${exerciseName}` : 'Time for your next set', sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL },
    });
  } catch {
    scheduledId = null;
  }
}

export async function cancelRestDone() {
  const id = scheduledId;
  scheduledId = null;
  if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}
