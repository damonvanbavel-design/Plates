export interface ThemeFonts {
  /** Big greeting / hero text */
  display: string;
  /** Section headings, numbers */
  heading: string;
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
}

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  dark: boolean;
  upper: boolean;
  pill: boolean;
  radius: number; // multiplier on base radii
  cardBorder: boolean;
  motif: 'none' | 'stack' | 'dots' | 'tape' | 'sparkle';
  /** app icon used on the home screen (Android) */
  iconId: string;
  /** optional header photo (custom themes) */
  image?: string | null;
  imageOverlay?: number;
  custom?: boolean;
  fonts: ThemeFonts;
  c: {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    nav: string;
    text: string;
    muted: string;
    accent: string;
    onAccent: string;
    tint: string;
    tintBorder: string;
    tintText: string;
    band: string;
    bandText: string;
    bandMuted: string;
    bandBtn: string;
    bandBtnText: string;
    danger: string;
  };
}

const inter = { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' };
const archivo = { regular: 'Archivo_400Regular', medium: 'Archivo_500Medium', semibold: 'Archivo_600SemiBold', bold: 'Archivo_700Bold' };
const dmsans = { regular: 'DMSans_400Regular', medium: 'DMSans_500Medium', semibold: 'DMSans_600SemiBold', bold: 'DMSans_700Bold' };

export const THEMES: AppTheme[] = [
  {
    id: 'night',
    name: 'Night Lift',
    description: 'Dark and focused with a lime accent.',
    dark: true,
    upper: false,
    pill: false,
    radius: 1,
    cardBorder: false,
    motif: 'none',
    iconId: 'night',
    fonts: { display: 'SpaceGrotesk_700Bold', heading: 'SpaceGrotesk_700Bold', ...inter },
    c: {
      bg: '#0E0F11',
      surface: '#17191C',
      surface2: '#202327',
      border: '#2A2D32',
      nav: '#141619',
      text: '#F2F3F5',
      muted: '#9BA1A8',
      accent: '#C6F432',
      onAccent: '#0E0F11',
      tint: '#1E2410',
      tintBorder: '#3F4D14',
      tintText: '#C9D3AE',
      band: '#0E0F11',
      bandText: '#F2F3F5',
      bandMuted: '#9BA1A8',
      bandBtn: '#202327',
      bandBtnText: '#F2F3F5',
      danger: '#FF6B6B',
    },
  },
  {
    id: 'chalk',
    name: 'Chalk',
    description: 'Warm off-white, burnt orange, condensed caps.',
    dark: false,
    upper: true,
    pill: false,
    radius: 0.5,
    cardBorder: false,
    motif: 'none',
    iconId: 'chalk',
    fonts: {
      display: 'BarlowCondensed_800ExtraBold',
      heading: 'BarlowCondensed_800ExtraBold',
      regular: 'Barlow_400Regular',
      medium: 'Barlow_500Medium',
      semibold: 'Barlow_600SemiBold',
      bold: 'Barlow_700Bold',
    },
    c: {
      bg: '#F3F0E8',
      surface: '#FFFFFF',
      surface2: '#ECE8DE',
      border: '#DCD7CA',
      nav: '#FBFAF6',
      text: '#1B1A17',
      muted: '#625E55',
      accent: '#B83D0B',
      onAccent: '#FFFFFF',
      tint: '#FBE9DD',
      tintBorder: '#F0C3A6',
      tintText: '#7E3410',
      band: '#F3F0E8',
      bandText: '#1B1A17',
      bandMuted: '#625E55',
      bandBtn: '#ECE8DE',
      bandBtnText: '#1B1A17',
      danger: '#B3261E',
    },
  },
  {
    id: 'iron',
    name: 'Iron',
    description: 'Near-black, square corners, red-orange.',
    dark: true,
    upper: true,
    pill: false,
    radius: 0.2,
    cardBorder: false,
    motif: 'none',
    iconId: 'iron',
    fonts: {
      display: 'Oswald_700Bold',
      heading: 'Oswald_700Bold',
      regular: 'IBMPlexSans_400Regular',
      medium: 'IBMPlexSans_500Medium',
      semibold: 'IBMPlexSans_600SemiBold',
      bold: 'IBMPlexSans_700Bold',
    },
    c: {
      bg: '#0B0B0B',
      surface: '#161616',
      surface2: '#222222',
      border: '#2E2E2E',
      nav: '#111111',
      text: '#EDEDED',
      muted: '#A6A6A6',
      accent: '#FF5A36',
      onAccent: '#0B0B0B',
      tint: '#2A1410',
      tintBorder: '#5C2518',
      tintText: '#E3B8AC',
      band: '#0B0B0B',
      bandText: '#EDEDED',
      bandMuted: '#A6A6A6',
      bandBtn: '#222222',
      bandBtnText: '#EDEDED',
      danger: '#FF6B6B',
    },
  },
  {
    id: 'calm',
    name: 'Calm',
    description: 'Soft blue-grey, rounded, friendly.',
    dark: false,
    upper: false,
    pill: false,
    radius: 1.4,
    cardBorder: false,
    motif: 'none',
    iconId: 'calm',
    fonts: { display: 'DMSans_700Bold', heading: 'DMSans_700Bold', ...dmsans },
    c: {
      bg: '#EEF1F5',
      surface: '#FFFFFF',
      surface2: '#E5E9F0',
      border: '#D5DBE4',
      nav: '#FFFFFF',
      text: '#172033',
      muted: '#566074',
      accent: '#3152DB',
      onAccent: '#FFFFFF',
      tint: '#E7EDFD',
      tintBorder: '#C3D0F7',
      tintText: '#33437F',
      band: '#EEF1F5',
      bandText: '#172033',
      bandMuted: '#566074',
      bandBtn: '#E5E9F0',
      bandBtnText: '#172033',
      danger: '#B3261E',
    },
  },
  {
    id: 'crimson',
    name: 'Crimson',
    description: 'Cream and crimson, poster headlines.',
    dark: false,
    upper: true,
    pill: false,
    radius: 0.35,
    cardBorder: true,
    motif: 'none',
    iconId: 'crimson',
    fonts: { display: 'Anton_400Regular', heading: 'Anton_400Regular', ...archivo },
    c: {
      bg: '#F6EFE4',
      surface: '#F6EFE4',
      surface2: '#EFE3D2',
      border: '#D1123F',
      nav: '#F6EFE4',
      text: '#A80E31',
      muted: '#7A3340',
      accent: '#D1123F',
      onAccent: '#F6EFE4',
      tint: '#FBE8EB',
      tintBorder: '#EDA9B5',
      tintText: '#8C1B33',
      band: '#D1123F',
      bandText: '#F6EFE4',
      bandMuted: '#F6EFE4',
      bandBtn: '#F6EFE4',
      bandBtnText: '#B00D33',
      danger: '#8C1B33',
    },
  },
  {
    id: 'sunny',
    name: 'Sunny',
    description: 'Yellow and cobalt, loud and cheerful.',
    dark: false,
    upper: true,
    pill: false,
    radius: 1.1,
    cardBorder: false,
    motif: 'stack',
    iconId: 'sunny',
    fonts: {
      display: 'Montserrat_900Black',
      heading: 'Montserrat_800ExtraBold',
      regular: 'Montserrat_400Regular',
      medium: 'Montserrat_500Medium',
      semibold: 'Montserrat_600SemiBold',
      bold: 'Montserrat_700Bold',
    },
    c: {
      bg: '#FECF02',
      surface: '#FFFFFF',
      surface2: '#FFF0A8',
      border: '#E8C200',
      nav: '#FFFFFF',
      text: '#0A2A66',
      muted: '#3D4F7A',
      accent: '#0153B3',
      onAccent: '#FECF02',
      tint: '#E3EDFB',
      tintBorder: '#B9D0F2',
      tintText: '#1F3F7A',
      band: '#0153B3',
      bandText: '#FECF02',
      bandMuted: '#DCE8FF',
      bandBtn: '#FECF02',
      bandBtnText: '#0153B3',
      danger: '#A4161A',
    },
  },
  {
    id: 'halftone',
    name: 'Halftone',
    description: 'Ultramarine, peach dots, elegant serif.',
    dark: true,
    upper: false,
    pill: true,
    radius: 1,
    cardBorder: false,
    motif: 'dots',
    iconId: 'halftone',
    fonts: { display: 'DMSerifDisplay_400Regular', heading: 'DMSerifDisplay_400Regular', ...inter },
    c: {
      bg: '#0B3AA6',
      surface: '#1848B4',
      surface2: '#2556C0',
      border: '#3A66C8',
      nav: '#0A3496',
      text: '#FCEFD8',
      muted: '#CFD8F2',
      accent: '#F2BE98',
      onAccent: '#13224F',
      tint: '#2A4E9E',
      tintBorder: '#5577C4',
      tintText: '#F5D9C3',
      band: '#0B3AA6',
      bandText: '#FCEFD8',
      bandMuted: '#C9D4F2',
      bandBtn: '#F2BE98',
      bandBtnText: '#13224F',
      danger: '#FFB4A8',
    },
  },
  {
    id: 'lash',
    name: 'Lash',
    description: 'Bubblegum pink, blackletter, caution tape.',
    dark: false,
    upper: true,
    pill: true,
    radius: 1.2,
    cardBorder: false,
    motif: 'tape',
    iconId: 'lash',
    fonts: { display: 'PirataOne_400Regular', heading: 'Anton_400Regular', ...archivo },
    c: {
      bg: '#F9C9E2',
      surface: '#FDEAF4',
      surface2: '#F6D3E6',
      border: '#EBA8CB',
      nav: '#FDEAF4',
      text: '#1F0A16',
      muted: '#6A2349',
      accent: '#A60A52',
      onAccent: '#FFFFFF',
      tint: '#FFFFFF',
      tintBorder: '#EBA8CB',
      tintText: '#7A1E4C',
      band: '#FCE3F0',
      bandText: '#C40D63',
      bandMuted: '#5E1440',
      bandBtn: '#1F0A16',
      bandBtnText: '#FCE3F0',
      danger: '#8E0E2E',
    },
  },
  {
    id: 'blush',
    name: 'Blush',
    description: 'Cream, soft pink, tomato red, serif.',
    dark: false,
    upper: false,
    pill: true,
    radius: 1.4,
    cardBorder: false,
    motif: 'sparkle',
    iconId: 'blush',
    fonts: { display: 'PlayfairDisplay_700Bold', heading: 'PlayfairDisplay_700Bold', ...dmsans },
    c: {
      bg: '#FBF3EA',
      surface: '#FFFFFF',
      surface2: '#F6E8DC',
      border: '#EED9C8',
      nav: '#FFFFFF',
      text: '#2B1A15',
      muted: '#6E5A50',
      accent: '#C62414',
      onAccent: '#FFFFFF',
      tint: '#FBE3E5',
      tintBorder: '#F2B9BF',
      tintText: '#8A2A20',
      band: '#F8CDD3',
      bandText: '#B11F12',
      bandMuted: '#6E2A22',
      bandBtn: '#C62414',
      bandBtnText: '#FFFFFF',
      danger: '#9E1C10',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep green and cream, calm and classic.',
    dark: false,
    upper: false,
    pill: false,
    radius: 1,
    cardBorder: false,
    motif: 'none',
    iconId: 'forest',
    fonts: { display: 'DMSerifDisplay_400Regular', heading: 'DMSerifDisplay_400Regular', ...dmsans },
    c: {
      bg: '#F1EFE6',
      surface: '#FFFFFF',
      surface2: '#E8E5D8',
      border: '#D8D3C2',
      nav: '#FFFFFF',
      text: '#13261B',
      muted: '#56604F',
      accent: '#1F5C3A',
      onAccent: '#FFFFFF',
      tint: '#E3EDE4',
      tintBorder: '#B9D3BF',
      tintText: '#1F4A31',
      band: '#1F5C3A',
      bandText: '#F1EFE6',
      bandMuted: '#CFE0D3',
      bandBtn: '#F1EFE6',
      bandBtnText: '#1F5C3A',
      danger: '#9E1C10',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Black and white, sharp and editorial.',
    dark: false,
    upper: true,
    pill: false,
    radius: 0.2,
    cardBorder: true,
    motif: 'none',
    iconId: 'mono',
    fonts: { display: 'Anton_400Regular', heading: 'Anton_400Regular', ...inter },
    c: {
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      surface2: '#F1F1F1',
      border: '#0A0A0A',
      nav: '#FFFFFF',
      text: '#0A0A0A',
      muted: '#555555',
      accent: '#0A0A0A',
      onAccent: '#FFFFFF',
      tint: '#EDEDED',
      tintBorder: '#BDBDBD',
      tintText: '#2B2B2B',
      band: '#0A0A0A',
      bandText: '#FFFFFF',
      bandMuted: '#CFCFCF',
      bandBtn: '#FFFFFF',
      bandBtnText: '#0A0A0A',
      danger: '#B3261E',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep navy with a bright teal accent.',
    dark: true,
    upper: false,
    pill: false,
    radius: 1.2,
    cardBorder: false,
    motif: 'none',
    iconId: 'ocean',
    fonts: { display: 'SpaceGrotesk_700Bold', heading: 'SpaceGrotesk_700Bold', ...inter },
    c: {
      bg: '#071A2B',
      surface: '#0E2A42',
      surface2: '#163654',
      border: '#22476A',
      nav: '#06182A',
      text: '#E6F4F8',
      muted: '#9FB8C8',
      accent: '#2DD4BF',
      onAccent: '#04201D',
      tint: '#0F3A40',
      tintBorder: '#1C6A66',
      tintText: '#A8EDE2',
      band: '#071A2B',
      bandText: '#E6F4F8',
      bandMuted: '#9FB8C8',
      bandBtn: '#163654',
      bandBtnText: '#E6F4F8',
      danger: '#FF8A80',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm plum with a glowing orange accent.',
    dark: true,
    upper: true,
    pill: true,
    radius: 1.2,
    cardBorder: false,
    motif: 'none',
    iconId: 'sunset',
    fonts: {
      display: 'Montserrat_900Black',
      heading: 'Montserrat_800ExtraBold',
      regular: 'Montserrat_400Regular',
      medium: 'Montserrat_500Medium',
      semibold: 'Montserrat_600SemiBold',
      bold: 'Montserrat_700Bold',
    },
    c: {
      bg: '#2A1230',
      surface: '#3A1B42',
      surface2: '#4A2453',
      border: '#5C3266',
      nav: '#26102C',
      text: '#FFEFE4',
      muted: '#D9B8C9',
      accent: '#FF8A3D',
      onAccent: '#2A1230',
      tint: '#4A2238',
      tintBorder: '#7A3A45',
      tintText: '#FFD2B4',
      band: '#2A1230',
      bandText: '#FFEFE4',
      bandMuted: '#D9B8C9',
      bandBtn: '#FF8A3D',
      bandBtnText: '#2A1230',
      danger: '#FFB4A8',
    },
  },
  {
    id: 'matcha',
    name: 'Matcha',
    description: 'Soft green and beige, gentle and fresh.',
    dark: false,
    upper: false,
    pill: true,
    radius: 1.4,
    cardBorder: false,
    motif: 'none',
    iconId: 'matcha',
    fonts: { display: 'DMSans_700Bold', heading: 'DMSans_700Bold', ...dmsans },
    c: {
      bg: '#EEF0E3',
      surface: '#FFFFFF',
      surface2: '#E4E8D6',
      border: '#D3D9C0',
      nav: '#FFFFFF',
      text: '#232A18',
      muted: '#5A6249',
      accent: '#55702F',
      onAccent: '#FFFFFF',
      tint: '#E4ECD5',
      tintBorder: '#C3D3A6',
      tintText: '#3D5220',
      band: '#DCE5C8',
      bandText: '#2E3E17',
      bandMuted: '#4F5C3A',
      bandBtn: '#55702F',
      bandBtnText: '#FFFFFF',
      danger: '#9E1C10',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Near-black with an electric magenta glow.',
    dark: true,
    upper: true,
    pill: false,
    radius: 0.6,
    cardBorder: false,
    motif: 'none',
    iconId: 'neon',
    fonts: {
      display: 'Oswald_700Bold',
      heading: 'Oswald_700Bold',
      regular: 'IBMPlexSans_400Regular',
      medium: 'IBMPlexSans_500Medium',
      semibold: 'IBMPlexSans_600SemiBold',
      bold: 'IBMPlexSans_700Bold',
    },
    c: {
      bg: '#0A0A12',
      surface: '#15151F',
      surface2: '#20202D',
      border: '#2C2C3D',
      nav: '#0D0D16',
      text: '#F3F0FF',
      muted: '#A9A6C0',
      accent: '#FF2BD6',
      onAccent: '#0A0A12',
      tint: '#2A1030',
      tintBorder: '#5C1F62',
      tintText: '#FFB8F0',
      band: '#0A0A12',
      bandText: '#F3F0FF',
      bandMuted: '#A9A6C0',
      bandBtn: '#20202D',
      bandBtnText: '#F3F0FF',
      danger: '#FF8A80',
    },
  },
];

/* ---------- colour helpers ---------- */

const hex = (h: string) => {
  const s = h.replace('#', '');
  const f =
    s.length === 3
      ? s
          .split('')
          .map((c) => c + c)
          .join('')
      : s;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const toHex = (rgb: number[]) =>
  '#' +
  rgb
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase();

export const isHex = (h: string) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h.trim());
export const normHex = (h: string) => {
  const s = h.trim().replace('#', '');
  return (
    '#' +
    (s.length === 3
      ? s
          .split('')
          .map((c) => c + c)
          .join('')
      : s
    ).toUpperCase()
  );
};

export function mix(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((v, i) => v + (B[i]! - v) * t));
}

export function luminance(h: string) {
  const c = hex(h).map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}

export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}

/** Nudge `fg` toward black or white until it reaches `min` contrast on `bg`. */
export function ensureContrast(fg: string, bg: string, min = 4.5) {
  if (contrast(fg, bg) >= min) return fg;
  const target = luminance(bg) > 0.4 ? '#000000' : '#FFFFFF';
  for (let t = 0.1; t <= 1.001; t += 0.1) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= min) return c;
  }
  return target;
}

/* ---------- custom themes ---------- */

export const HEADING_FONTS: { key: string; label: string; upper: boolean; body: typeof inter }[] = [
  { key: 'SpaceGrotesk_700Bold', label: 'Grotesk', upper: false, body: inter },
  { key: 'DMSans_700Bold', label: 'Rounded', upper: false, body: dmsans },
  {
    key: 'BarlowCondensed_800ExtraBold',
    label: 'Condensed',
    upper: true,
    body: { regular: 'Barlow_400Regular', medium: 'Barlow_500Medium', semibold: 'Barlow_600SemiBold', bold: 'Barlow_700Bold' },
  },
  {
    key: 'Oswald_700Bold',
    label: 'Athletic',
    upper: true,
    body: { regular: 'IBMPlexSans_400Regular', medium: 'IBMPlexSans_500Medium', semibold: 'IBMPlexSans_600SemiBold', bold: 'IBMPlexSans_700Bold' },
  },
  { key: 'Anton_400Regular', label: 'Poster', upper: true, body: archivo },
  {
    key: 'Montserrat_900Black',
    label: 'Heavy',
    upper: true,
    body: { regular: 'Montserrat_400Regular', medium: 'Montserrat_500Medium', semibold: 'Montserrat_600SemiBold', bold: 'Montserrat_700Bold' },
  },
  { key: 'DMSerifDisplay_400Regular', label: 'Serif', upper: false, body: inter },
  { key: 'PlayfairDisplay_700Bold', label: 'Elegant', upper: false, body: dmsans },
  { key: 'PirataOne_400Regular', label: 'Gothic', upper: false, body: archivo },
];

export const ICON_IDS = THEMES.map((t) => t.id);

export interface CustomSpecLike {
  id: string;
  name: string;
  bg: string;
  surface: string;
  accent: string;
  headingFont: string;
  radius: number;
  image?: string | null;
  imageOverlay: number;
  iconId: string;
}

/** Build a complete, readable theme from the few colours the user picked. */
export function themeFromSpec(sp: CustomSpecLike): AppTheme {
  const dark = luminance(sp.bg) < 0.25;
  const ink = dark ? '#F4F4F6' : '#15171A';
  const text = ensureContrast(ink, sp.surface, 7);
  const muted = ensureContrast(mix(text, sp.surface, 0.4), sp.surface, 4.6);
  const accentOnBg = sp.accent;
  const onAccent = contrast('#FFFFFF', accentOnBg) >= contrast('#111111', accentOnBg) ? '#FFFFFF' : '#111111';
  const tint = mix(sp.surface, sp.accent, dark ? 0.16 : 0.12);
  const font = HEADING_FONTS.find((f) => f.key === sp.headingFont) ?? HEADING_FONTS[0]!;
  const hasImage = !!sp.image;
  return {
    id: sp.id,
    name: sp.name,
    description: 'Your custom theme',
    dark,
    upper: font.upper,
    pill: sp.radius >= 1.6,
    radius: sp.radius,
    cardBorder: false,
    motif: 'none',
    iconId: sp.iconId,
    image: sp.image ?? null,
    imageOverlay: sp.imageOverlay,
    custom: true,
    fonts: { display: font.key, heading: font.key, ...font.body },
    c: {
      bg: sp.bg,
      surface: sp.surface,
      surface2: mix(sp.surface, ink, 0.07),
      border: mix(sp.surface, ink, 0.16),
      nav: sp.surface,
      text,
      muted,
      accent: sp.accent,
      onAccent,
      tint,
      tintBorder: mix(sp.surface, sp.accent, 0.4),
      tintText: ensureContrast(mix(text, sp.accent, 0.35), tint, 4.6),
      band: sp.bg,
      bandText: hasImage ? '#FFFFFF' : ensureContrast(ink, sp.bg, 7),
      bandMuted: hasImage ? '#E8E8E8' : ensureContrast(mix(ink, sp.bg, 0.35), sp.bg, 4.6),
      bandBtn: hasImage ? 'rgba(0,0,0,0.45)' : mix(sp.bg, ink, 0.1),
      bandBtnText: hasImage ? '#FFFFFF' : ensureContrast(ink, mix(sp.bg, ink, 0.1), 4.6),
      danger: dark ? '#FF8A80' : '#B3261E',
    },
  };
}

export function getTheme(id: string, customs: CustomSpecLike[] = []): AppTheme {
  const builtIn = THEMES.find((t) => t.id === id);
  if (builtIn) return builtIn;
  const c = customs.find((x) => x.id === id);
  return c ? themeFromSpec(c) : THEMES[0]!;
}
