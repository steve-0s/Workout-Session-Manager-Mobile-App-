import React from 'react';
import { Text, TextProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface IconSymbolProps extends TextProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
}

export function IconSymbol({ name, size = 24, color = '#000', ...props }: IconSymbolProps) {
  return (
    <Text {...props}>
      <MaterialIcons name={name} size={size} color={color} />
    </Text>
  );
}
