/** @type {const} */
const themeColors = {
  // Primary brand colors
  primary: { light: 'hsl(231, 48%, 48%)', dark: 'hsl(220, 70%, 60%)' },
  background: { light: 'hsl(0, 0%, 100%)', dark: 'hsl(230, 35%, 15%)' },
  surface: { light: 'hsl(0, 0%, 96%)', dark: 'hsl(232, 32%, 18%)' },
  foreground: { light: 'hsl(34, 19%, 14%)', dark: 'hsl(0, 0%, 100%)' },
  muted: { light: 'hsl(231, 15%, 45%)', dark: 'hsl(0, 0%, 75%)' },
  border: { light: 'hsl(231, 15%, 90%)', dark: 'hsl(232, 25%, 28%)' },
  
  // Secondary colors
  secondary: { light: 'hsl(179, 75%, 45%)', dark: 'hsl(260, 60%, 60%)' },
  accent: { light: 'hsl(29, 95%, 55%)', dark: 'hsl(270, 65%, 65%)' },
  
  // Status colors
  success: { light: 'hsl(142, 76%, 36%)', dark: 'hsl(142, 76%, 46%)' },
  warning: { light: 'hsl(29, 95%, 55%)', dark: 'hsl(29, 95%, 60%)' },
  error: { light: 'hsl(0, 84%, 60%)', dark: 'hsl(0, 84%, 55%)' },
  
  // Feature-specific colors
  love: { light: 'hsl(330, 81%, 60%)', dark: 'hsl(330, 81%, 65%)' },
  podcast: { light: 'hsl(280, 80%, 55%)', dark: 'hsl(280, 80%, 60%)' },
  accommodation: { light: 'hsl(30, 90%, 50%)', dark: 'hsl(30, 90%, 55%)' },
  
  // Tint for tab bar
  tint: { light: 'hsl(231, 48%, 48%)', dark: 'hsl(220, 70%, 60%)' },
};

module.exports = { themeColors };
