# Plates

A workout tracker for your phone, built with Expo (React Native). Log sets in two taps, see what you lifted last time, get a rest timer automatically, track personal records and progress, check your strength rank, and pick from nine themes.

Everything is stored on your phone. No account and no internet needed.

## Install the APK on Android (no computer needed)

Every push to `main` builds the app on GitHub (see `.github/workflows/android-apk.yml`, about 15–20 minutes) and publishes it under **Releases**.

1. On your phone, open this repository's **Releases** page and tap the newest `plates-…apk`.
2. Open the downloaded file. If Android asks, allow your browser to install unknown apps.
3. Later builds install over the old one and keep your data.

You can also start a build by hand: **Actions → Build Android APK → Run workflow**.

## Run it in development with Expo Go (about 10 minutes)

1. **Install Node.js** (version 20 or newer) on your computer: https://nodejs.org
2. **Install Expo Go** on your phone from the App Store or Google Play.
3. Unzip this folder, open a terminal in it, and run:

   ```bash
   npm install
   npx expo start
   ```

4. A QR code appears in the terminal. Scan it with your iPhone camera (iOS) or with the Expo Go app (Android). Your phone and computer must be on the same Wi-Fi.

The app reloads by itself when you change the code.

> If Expo Go says the project needs a newer or older SDK, update Expo Go from the app store. This project uses Expo SDK 58.

## What's inside

| Feature | Where |
| --- | --- |
| First-launch setup: units, starter routines, weekly goal | `src/app/onboarding.tsx` |
| Home: week strip, start a workout, routines, last workout | `src/app/(tabs)/index.tsx` |
| Active workout: sets, previous numbers, rest timer, PR hints | `src/app/workout.tsx` |
| Exercise picker with search, filters and custom exercises | `src/app/picker.tsx` |
| Workout summary with new personal records and notes | `src/app/summary/[id].tsx` |
| Routine editor | `src/app/routine/[id].tsx` |
| History calendar and workout details | `src/app/(tabs)/history.tsx`, `src/app/history/[id].tsx` |
| Progress charts and records | `src/app/(tabs)/progress.tsx` |
| Rank: form, result and standards | `src/app/rank/` |
| Profile: theme, units, rest timer, body details, CSV export, reset | `src/app/(tabs)/profile.tsx` |
| Theme picker (9 looks) | `src/app/themes.tsx`, colours and fonts in `src/lib/themes.ts` |

Data lives in `src/lib/store.ts` (Zustand, saved to SQLite on the phone). The 49 built-in exercises and starter routines are in `src/lib/exercises.ts`.

## Before you publish: replace the Rank standards

The numbers in `src/lib/standards.ts` are **placeholders** made from simple bodyweight ratios, so the feature works end to end. They are not research data. Before releasing the app:

1. Choose a source you're allowed to use, for example:
   - FitnessVolt open strength data (CC BY 4.0, needs a visible "Powered by FitnessVolt" link): https://fitnessvolt.com/strength-standards/strength-data/
   - OpenPowerlifting (public domain; squat, bench and deadlift from competitions): https://www.openpowerlifting.org
2. Replace `RATIOS` and `thresholds()` with that data, and `ageFactor()` with a published set of age coefficients.
3. Update `STANDARDS_SOURCE` (its label is shown in the app) and add the attribution link if the licence needs one.

Rank currently covers free-weight lifts only (bench, incline bench, squat, front squat, deadlift, overhead press, barbell row, Romanian deadlift). Machine exercises show a "coming soon" note.

## Useful commands

```bash
npx expo start          # run the app
npx tsc --noEmit        # typecheck
npx expo lint           # lint
```

To make a real installable app for the App Store or Google Play, use Expo's build service: https://docs.expo.dev/build/introduction/

## Ideas for next versions

- Cloud sync and backup across devices (the plan suggests Supabase)
- Bodyweight log and plate calculator
- Progression suggestions for the next session
- Apple Health / Google Fit
