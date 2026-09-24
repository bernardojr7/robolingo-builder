/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#FFFFFF',
    tint: '#09A9FF',
    background: '#061A3B',
    foreground: '#FFFFFF',
    card: '#0D2E5E',
    cardForeground: '#FFFFFF',
    primary: '#09A9FF',
    primaryForeground: '#FFFFFF',
    secondary: '#153F76',
    secondaryForeground: '#B9E7FF',
    muted: '#12335D',
    mutedForeground: '#9EC0E8',
    accent: '#FFC92D',
    accentForeground: '#25324F',
    destructive: '#F04F5F',
    destructiveForeground: '#FFFFFF',
    border: '#2B65A3',
    input: '#2B65A3',
    heroStart: '#073375',
    heroEnd: '#05A4ED',
    success: '#25D77C',
    purple: '#8F7BFF',
  },
  dark: {
    text: '#FFFFFF',
    tint: '#09A9FF',
    background: '#061A3B',
    foreground: '#FFFFFF',
    card: '#0D2E5E',
    cardForeground: '#FFFFFF',
    primary: '#09A9FF',
    primaryForeground: '#FFFFFF',
    secondary: '#153F76',
    secondaryForeground: '#B9E7FF',
    muted: '#12335D',
    mutedForeground: '#9EC0E8',
    accent: '#FFC92D',
    accentForeground: '#25324F',
    destructive: '#F17B90',
    destructiveForeground: '#FFFFFF',
    border: '#2B65A3',
    input: '#2B65A3',
    heroStart: '#073375',
    heroEnd: '#05A4ED',
    success: '#25D77C',
    purple: '#8F7BFF',
  },
  radius: 18,
};

export default colors;
