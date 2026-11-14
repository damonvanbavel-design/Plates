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
    id: 'night', name: 'Night Lift', description: 'Dark and focused with a lime accent.', dark: true, upper: false, pill: false, radius: 1, cardBorder: false, motif: 'none',
    fonts: { display: 'SpaceGrotesk_700Bold', heading: 'SpaceGrotesk_700Bold', ...inter },
    c: { bg: '#0E0F11', surface: '#17191C', surface2: '#202327', border: '#2A2D32', nav: '#141619', text: '#F2F3F5', muted: '#9BA1A8', accent: '#C6F432', onAccent: '#0E0F11',
      tint: '#1E2410', tintBorder: '#3F4D14', tintText: '#C9D3AE', band: '#0E0F11', bandText: '#F2F3F5', bandMuted: '#9BA1A8', bandBtn: '#202327', bandBtnText: '#F2F3F5', danger: '#FF6B6B' },
  },
  {
    id: 'chalk', name: 'Chalk', description: 'Warm off-white, burnt orange, condensed caps.', dark: false, upper: true, pill: false, radius: 0.5, cardBorder: false, motif: 'none',
    fonts: { display: 'BarlowCondensed_800ExtraBold', heading: 'BarlowCondensed_800ExtraBold', regular: 'Barlow_400Regular', medium: 'Barlow_500Medium', semibold: 'Barlow_600SemiBold', bold: 'Barlow_700Bold' },
    c: { bg: '#F3F0E8', surface: '#FFFFFF', surface2: '#ECE8DE', border: '#DCD7CA', nav: '#FBFAF6', text: '#1B1A17', muted: '#625E55', accent: '#B83D0B', onAccent: '#FFFFFF',
      tint: '#FBE9DD', tintBorder: '#F0C3A6', tintText: '#7E3410', band: '#F3F0E8', bandText: '#1B1A17', bandMuted: '#625E55', bandBtn: '#ECE8DE', bandBtnText: '#1B1A17', danger: '#B3261E' },
  },
  {
    id: 'iron', name: 'Iron', description: 'Near-black, square corners, red-orange.', dark: true, upper: true, pill: false, radius: 0.2, cardBorder: false, motif: 'none',
    fonts: { display: 'Oswald_700Bold', heading: 'Oswald_700Bold', regular: 'IBMPlexSans_400Regular', medium: 'IBMPlexSans_500Medium', semibold: 'IBMPlexSans_600SemiBold', bold: 'IBMPlexSans_700Bold' },
    c: { bg: '#0B0B0B', surface: '#161616', surface2: '#222222', border: '#2E2E2E', nav: '#111111', text: '#EDEDED', muted: '#A6A6A6', accent: '#FF5A36', onAccent: '#0B0B0B',
      tint: '#2A1410', tintBorder: '#5C2518', tintText: '#E3B8AC', band: '#0B0B0B', bandText: '#EDEDED', bandMuted: '#A6A6A6', bandBtn: '#222222', bandBtnText: '#EDEDED', danger: '#FF6B6B' },
  },
  {
    id: 'calm', name: 'Calm', description: 'Soft blue-grey, rounded, friendly.', dark: false, upper: false, pill: false, radius: 1.4, cardBorder: false, motif: 'none',
    fonts: { display: 'DMSans_700Bold', heading: 'DMSans_700Bold', ...dmsans },
    c: { bg: '#EEF1F5', surface: '#FFFFFF', surface2: '#E5E9F0', border: '#D5DBE4', nav: '#FFFFFF', text: '#172033', muted: '#566074', accent: '#3152DB', onAccent: '#FFFFFF',
      tint: '#E7EDFD', tintBorder: '#C3D0F7', tintText: '#33437F', band: '#EEF1F5', bandText: '#172033', bandMuted: '#566074', bandBtn: '#E5E9F0', bandBtnText: '#172033', danger: '#B3261E' },
  },
  {
    id: 'crimson', name: 'Crimson', description: 'Cream and crimson, poster headlines.', dark: false, upper: true, pill: false, radius: 0.35, cardBorder: true, motif: 'none',
    fonts: { display: 'Anton_400Regular', heading: 'Anton_400Regular', ...archivo },
    c: { bg: '#F6EFE4', surface: '#F6EFE4', surface2: '#EFE3D2', border: '#D1123F', nav: '#F6EFE4', text: '#A80E31', muted: '#7A3340', accent: '#D1123F', onAccent: '#F6EFE4',
      tint: '#FBE8EB', tintBorder: '#EDA9B5', tintText: '#8C1B33', band: '#D1123F', bandText: '#F6EFE4', bandMuted: '#F6EFE4', bandBtn: '#F6EFE4', bandBtnText: '#B00D33', danger: '#8C1B33' },
  },
  {
    id: 'sunny', name: 'Sunny', description: 'Yellow and cobalt, loud and cheerful.', dark: false, upper: true, pill: false, radius: 1.1, cardBorder: false, motif: 'stack',
    fonts: { display: 'Montserrat_900Black', heading: 'Montserrat_800ExtraBold', regular: 'Montserrat_400Regular', medium: 'Montserrat_500Medium', semibold: 'Montserrat_600SemiBold', bold: 'Montserrat_700Bold' },
    c: { bg: '#FECF02', surface: '#FFFFFF', surface2: '#FFF0A8', border: '#E8C200', nav: '#FFFFFF', text: '#0A2A66', muted: '#3D4F7A', accent: '#0153B3', onAccent: '#FECF02',
      tint: '#E3EDFB', tintBorder: '#B9D0F2', tintText: '#1F3F7A', band: '#0153B3', bandText: '#FECF02', bandMuted: '#DCE8FF', bandBtn: '#FECF02', bandBtnText: '#0153B3', danger: '#A4161A' },
  },
  {
    id: 'halftone', name: 'Halftone', description: 'Ultramarine, peach dots, elegant serif.', dark: true, upper: false, pill: true, radius: 1, cardBorder: false, motif: 'dots',
    fonts: { display: 'DMSerifDisplay_400Regular', heading: 'DMSerifDisplay_400Regular', ...inter },
    c: { bg: '#0B3AA6', surface: '#1848B4', surface2: '#2556C0', border: '#3A66C8', nav: '#0A3496', text: '#FCEFD8', muted: '#CFD8F2', accent: '#F2BE98', onAccent: '#13224F',
      tint: '#2A4E9E', tintBorder: '#5577C4', tintText: '#F5D9C3', band: '#0B3AA6', bandText: '#FCEFD8', bandMuted: '#C9D4F2', bandBtn: '#F2BE98', bandBtnText: '#13224F', danger: '#FFB4A8' },
  },
  {
    id: 'lash', name: 'Lash', description: 'Bubblegum pink, blackletter, caution tape.', dark: false, upper: true, pill: true, radius: 1.2, cardBorder: false, motif: 'tape',
    fonts: { display: 'PirataOne_400Regular', heading: 'Anton_400Regular', ...archivo },
    c: { bg: '#F9C9E2', surface: '#FDEAF4', surface2: '#F6D3E6', border: '#EBA8CB', nav: '#FDEAF4', text: '#1F0A16', muted: '#6A2349', accent: '#A60A52', onAccent: '#FFFFFF',
      tint: '#FFFFFF', tintBorder: '#EBA8CB', tintText: '#7A1E4C', band: '#FCE3F0', bandText: '#C40D63', bandMuted: '#5E1440', bandBtn: '#1F0A16', bandBtnText: '#FCE3F0', danger: '#8E0E2E' },
  },
  {
    id: 'blush', name: 'Blush', description: 'Cream, soft pink, tomato red, serif.', dark: false, upper: false, pill: true, radius: 1.4, cardBorder: false, motif: 'sparkle',
    fonts: { display: 'PlayfairDisplay_700Bold', heading: 'PlayfairDisplay_700Bold', ...dmsans },
    c: { bg: '#FBF3EA', surface: '#FFFFFF', surface2: '#F6E8DC', border: '#EED9C8', nav: '#FFFFFF', text: '#2B1A15', muted: '#6E5A50', accent: '#C62414', onAccent: '#FFFFFF',
      tint: '#FBE3E5', tintBorder: '#F2B9BF', tintText: '#8A2A20', band: '#F8CDD3', bandText: '#B11F12', bandMuted: '#6E2A22', bandBtn: '#C62414', bandBtnText: '#FFFFFF', danger: '#9E1C10' },
  },
];

export const getTheme = (id: string): AppTheme => THEMES.find((t) => t.id === id) ?? THEMES[0];
