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
    text: '#132238',
    tint: '#2F80ED',
    background: '#F4F8FC',
    foreground: '#132238',
    card: '#FFFFFF',
    cardForeground: '#132238',
    primary: '#2F80ED',
    primaryForeground: '#FFFFFF',
    secondary: '#E8F2FF',
    secondaryForeground: '#1459A6',
    muted: '#E8EEF5',
    mutedForeground: '#72839A',
    accent: '#FFD166',
    accentForeground: '#6A4300',
    destructive: '#E85D75',
    destructiveForeground: '#FFFFFF',
    border: '#D9E3EF',
    input: '#D9E3EF',
    heroStart: '#173D72',
    heroEnd: '#276FC9',
    success: '#37B97D',
    purple: '#7A65D1',
  },
  dark: {
    text: '#F5F8FC',
    tint: '#62A4FF',
    background: '#0D1726',
    foreground: '#F5F8FC',
    card: '#15263D',
    cardForeground: '#F5F8FC',
    primary: '#62A4FF',
    primaryForeground: '#0D1726',
    secondary: '#1E3757',
    secondaryForeground: '#BBD9FF',
    muted: '#1A2D45',
    mutedForeground: '#A5B5C9',
    accent: '#FFD166',
    accentForeground: '#5A3A00',
    destructive: '#F17B90',
    destructiveForeground: '#0D1726',
    border: '#29415F',
    input: '#29415F',
    heroStart: '#132D50',
    heroEnd: '#245A9F',
    success: '#5CD39A',
    purple: '#A38FEA',
  },
  radius: 18,
};

export default colors;
