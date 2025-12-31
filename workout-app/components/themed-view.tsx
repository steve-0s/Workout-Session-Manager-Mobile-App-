import React from 'react';
import { View, ViewProps, useColorScheme } from 'react-native';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({ style, lightColor, darkColor, ...props }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? darkColor || '#000' : lightColor || '#fff';

  return (
    <View
      style={[
        { backgroundColor },
        style,
      ]}
      {...props}
    />
  );
}
