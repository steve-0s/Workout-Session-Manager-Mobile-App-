import { Slot } from "expo-router";
import { View } from "react-native";
import React from "react";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
