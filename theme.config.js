/** @type {const} */
const themeColors = {
  // Primary brand color — vibrant indigo/violet (replaces the flat navy)
  primary: { light: 'hsl(250, 84%, 58%)', dark: 'hsl(250, 90%, 68%)' },

  // Backgrounds — light stays white; dark gets a deep warm charcoal (not navy)
  background: { light: 'hsl(0, 0%, 98%)', dark: 'hsl(224, 18%, 14%)' },

  // Surface — cards and panels; dark gets a slightly warmer tone
  surface: { light: 'hsl(240, 20%, 97%)', dark: 'hsl(224, 16%, 20%)' },

  // Foreground text
  foreground: { light: 'hsl(224, 25%, 12%)', dark: 'hsl(0, 0%, 97%)' },

  // Muted / secondary text
  muted: { light: 'hsl(220, 15%, 52%)', dark: 'hsl(220, 12%, 65%)' },

  // Borders
  border: { light: 'hsl(220, 20%, 90%)', dark: 'hsl(224, 14%, 28%)' },

  // Secondary — teal/emerald for contrast sections
  secondary: { light: 'hsl(168, 72%, 40%)', dark: 'hsl(168, 72%, 52%)' },

  // Accent — warm amber/orange for highlights and CTAs
  accent: { light: 'hsl(36, 96%, 52%)', dark: 'hsl(36, 96%, 60%)' },

  // Status colors
  success: { light: 'hsl(142, 70%, 38%)', dark: 'hsl(142, 70%, 48%)' },
  warning: { light: 'hsl(36, 96%, 52%)', dark: 'hsl(36, 96%, 60%)' },
  error: { light: 'hsl(4, 86%, 58%)', dark: 'hsl(4, 86%, 64%)' },

  // Feature-specific accent colors — each section has its own identity
  love: { light: 'hsl(340, 82%, 58%)', dark: 'hsl(340, 82%, 65%)' },
  podcast: { light: 'hsl(280, 78%, 52%)', dark: 'hsl(280, 78%, 62%)' },
  accommodation: { light: 'hsl(28, 92%, 50%)', dark: 'hsl(28, 92%, 58%)' },

  // Tab bar tint
  tint: { light: 'hsl(250, 84%, 58%)', dark: 'hsl(250, 90%, 68%)' },
};
module.exports = { themeColors };
