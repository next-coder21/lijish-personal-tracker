/**
 * The five themes, each a complete role set rather than a light/dark pair —
 * "Deep Focus Dark" is simply the dark one. Picking a palette is the only
 * appearance control; there is no separate light/dark switch.
 *
 * `className` is what next-themes writes onto `<html>` — one token each, since
 * next-themes writes it through `classList` and rejects anything with a space.
 * Tailwind's `dark:` variant is pointed at `.theme-focus-dark` in globals.css
 * rather than a separate `dark` class, so the shadcn components that rely on it
 * still work.
 */
export interface Palette {
  id: string;
  name: string;
  blurb: string;
  className: string;
  isDark: boolean;
  /** Swatch shown in the picker: background, surface, primary, accent. */
  swatch: [string, string, string, string];
}

export const PALETTES: Palette[] = [
  {
    id: "scholar",
    name: "Scholar Light",
    blurb: "Clean and calm — the easiest to read for long sessions",
    className: "theme-scholar",
    isDark: false,
    swatch: ["#FAF7F2", "#FFFFFF", "#4F46E5", "#F59E0B"],
  },
  {
    id: "focus-dark",
    name: "Deep Focus Dark",
    blurb: "Night mode, for study after dark",
    className: "theme-focus-dark",
    isDark: true,
    swatch: ["#0F172A", "#1E293B", "#818CF8", "#FBBF24"],
  },
  {
    id: "forest",
    name: "Forest Growth",
    blurb: "Natural and progress-oriented",
    className: "theme-forest",
    isDark: false,
    swatch: ["#F4F7F4", "#FFFFFF", "#2F6B4F", "#E2A93B"],
  },
  {
    id: "paper",
    name: "Paper & Ink",
    blurb: "A notebook feel, for a tracker that stays personal",
    className: "theme-paper",
    isDark: false,
    swatch: ["#FAF9F5", "#FFFDF8", "#1D4ED8", "#D97706"],
  },
  {
    id: "vibrant",
    name: "Vibrant Productivity",
    blurb: "Energetic and gamified",
    className: "theme-vibrant",
    isDark: false,
    swatch: ["#F8FAFC", "#FFFFFF", "#7C3AED", "#F59E0B"],
  },
];

export const DEFAULT_PALETTE = "scholar";

export const PALETTE_IDS = PALETTES.map((p) => p.id);

/** next-themes `value` map: theme id -> the class string written to <html>. */
export const PALETTE_CLASSES = Object.fromEntries(
  PALETTES.map((p) => [p.id, p.className]),
);

export const paletteById = (id: string | undefined) =>
  PALETTES.find((p) => p.id === id) ?? PALETTES[0];
