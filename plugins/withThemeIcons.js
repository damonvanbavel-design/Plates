/**
 * Adds one launcher icon per theme (Android).
 * - copies the generated icons from assets/app-icons/android into res/
 * - moves the LAUNCHER entry from MainActivity to <activity-alias> elements,
 *   one per icon; modules/plates-icon enables the one matching the theme.
 */
const fs = require('fs');
const path = require('path');
const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

const ICONS = [
  'night',
  'chalk',
  'iron',
  'calm',
  'crimson',
  'sunny',
  'halftone',
  'lash',
  'blush',
  'forest',
  'mono',
  'ocean',
  'sunset',
  'matcha',
  'neon',
];
const DEFAULT_ICON = 'night';

function withIconResources(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, 'assets', 'app-icons', 'android');
      const res = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
      for (const dir of fs.readdirSync(src)) {
        const out = path.join(res, dir);
        fs.mkdirSync(out, { recursive: true });
        for (const file of fs.readdirSync(path.join(src, dir))) fs.copyFileSync(path.join(src, dir, file), path.join(out, file));
      }
      const anydpi = path.join(res, 'mipmap-anydpi-v26');
      fs.mkdirSync(anydpi, { recursive: true });
      for (const id of ICONS) {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_plates_${id}_bg"/>
    <foreground android:drawable="@mipmap/ic_plates_${id}_fg"/>
</adaptive-icon>
`;
        fs.writeFileSync(path.join(anydpi, `ic_plates_${id}.xml`), xml);
        fs.writeFileSync(path.join(anydpi, `ic_plates_${id}_round.xml`), xml);
      }
      return cfg;
    },
  ]);
}

function withIconAliases(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (!app) return cfg;
    const main = (app.activity ?? []).find((a) => a.$['android:name'] === '.MainActivity');
    if (!main) return cfg;

    // remove the LAUNCHER category from MainActivity (keep deep-link filters)
    main['intent-filter'] = (main['intent-filter'] ?? []).filter((f) => {
      const isLauncher = (f.category ?? []).some((c) => c.$['android:name'] === 'android.intent.category.LAUNCHER');
      return !isLauncher;
    });

    app['activity-alias'] = (app['activity-alias'] ?? []).filter((a) => !String(a.$['android:name']).startsWith('.MainActivity_'));
    for (const id of ICONS) {
      app['activity-alias'].push({
        $: {
          'android:name': `.MainActivity_${id}`,
          'android:enabled': id === DEFAULT_ICON ? 'true' : 'false',
          'android:exported': 'true',
          'android:icon': `@mipmap/ic_plates_${id}`,
          'android:roundIcon': `@mipmap/ic_plates_${id}_round`,
          'android:targetActivity': '.MainActivity',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
          },
        ],
      });
    }
    return cfg;
  });
}

module.exports = function withThemeIcons(config) {
  return withIconAliases(withIconResources(config));
};
