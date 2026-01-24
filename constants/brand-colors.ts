// Brand colors inspired by StudentKonnect website
// Purple/Blue gradient theme with gold accents

export const BRAND_COLORS = {
  // Primary gradient colors
  purple: {
    light: '#9333EA',
    DEFAULT: '#7C3AED',
    dark: '#6B46C1',
  },
  blue: {
    light: '#60A5FA',
    DEFAULT: '#3B82F6',
    dark: '#2563EB',
  },
  
  // Accent colors
  gold: {
    light: '#FCD34D',
    DEFAULT: '#F59E0B',
    dark: '#D97706',
  },
  orange: {
    light: '#FDBA74',
    DEFAULT: '#FB923C',
    dark: '#F97316',
  },
  
  // UI colors
  cyan: '#06B6D4',
  teal: '#14B8A6',
  
  // Gradients (for LinearGradient)
  gradients: {
    primary: ['#9333EA', '#7C3AED', '#6B46C1'],
    hero: ['#9333EA', '#3B82F6'],
    accent: ['#F59E0B', '#FB923C'],
    card: ['#7C3AED', '#3B82F6'],
  },
};

// Feature category colors (for visual distinction)
export const FEATURE_COLORS = {
  financial: BRAND_COLORS.blue.DEFAULT,
  shopping: BRAND_COLORS.purple.DEFAULT,
  entertainment: BRAND_COLORS.orange.DEFAULT,
  wellness: BRAND_COLORS.teal,
  education: BRAND_COLORS.gold.DEFAULT,
  social: BRAND_COLORS.cyan,
  career: BRAND_COLORS.purple.dark,
};
