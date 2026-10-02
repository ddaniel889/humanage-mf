export type HlColor =
  | 'primary'
  | 'accent'
  | 'warn'
  | 'blue'
  | 'brown'
  | 'green'
  | 'orange'
  | 'red'
  | 'violet';

export const COLOR_CLASSES: Record<HlColor, string> = {
  primary: 'tw-bg-[var(--mf-color-primary)] tw-text-[var(--mf-color-contrast-primary)]',
  accent: 'tw-bg-[var(--mf-color-accent)] tw-text-[var(--mf-color-contrast-accent)]',
  warn: 'tw-bg-[var(--mf-color-warn)] tw-text-[var(--mf-color-contrast-warn)]',
  green: 'tw-bg-[var(--mf-color-green)] tw-text-[var(--mf-color-contrast-green)]',
  red: 'tw-bg-[var(--mf-color-red)] tw-text-[var(--mf-color-contrast-red)]',
  blue: 'tw-bg-[var(--mf-color-blue)] tw-text-[var(--mf-color-contrast-blue)]',
  brown: 'tw-bg-[var(--mf-color-brown)] tw-text-[var(--mf-color-contrast-brown)]',
  orange: 'tw-bg-[var(--mf-color-orange)] tw-text-[var(--mf-color-contrast-orange)]',
  violet: 'tw-bg-[var(--mf-color-violet)] tw-text-[var(--mf-color-contrast-violet)]',
};
