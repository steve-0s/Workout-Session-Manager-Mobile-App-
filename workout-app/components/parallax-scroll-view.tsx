import React from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';

interface ParallaxScrollViewProps extends ScrollViewProps {
  headerImage?: React.ReactNode;
  children: React.ReactNode;
}

export default function ParallaxScrollView({ headerImage, children, ...props }: ParallaxScrollViewProps) {
  return (
    <ScrollView {...props}>
      {headerImage && <View>{headerImage}</View>}
      {children}
    </ScrollView>
  );
}
