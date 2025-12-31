/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primaryAccent = '#FF6B00'; // Neon orange primary accent
const secondaryAccent = '#00E0FF'; // Cyan secondary accent

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#0B0F14',
    tint: primaryAccent,
    icon: '#8B97A7',
    tabIconDefault: '#8B97A7',
    tabIconSelected: primaryAccent,
    card: '#131A22',
    border: '#1F2937',
    success: '#00FF85',
    warning: '#F59E0B',
    error: '#FF3B3B',
    primary: primaryAccent,
    secondary: secondaryAccent,
    gradientStart: primaryAccent,
    gradientEnd: '#FF8533',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0B0F14',
    tint: primaryAccent,
    icon: '#8B97A7',
    tabIconDefault: '#8B97A7',
    tabIconSelected: primaryAccent,
    card: '#131A22',
    border: '#1F2937',
    success: '#00FF85',
    warning: '#F59E0B',
    error: '#FF3B3B',
    primary: primaryAccent,
    secondary: secondaryAccent,
    gradientStart: primaryAccent,
    gradientEnd: '#FF8533',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
