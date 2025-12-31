import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function ModalScreen() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const router = useRouter();

  const addWorkout = () => {
    // For now, we just log it. Later you can connect to state/store/backend
    console.log("New Workout:", { name, type });

    // Close modal and go back
    router.back();
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Add Workout
      </Text>

      <TextInput
        placeholder="Workout Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
        }}
      />

      <TextInput
        placeholder="Workout Type (Strength, Cardio, etc.)"
        value={type}
        onChangeText={setType}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
        }}
      />

      <TouchableOpacity
        onPress={addWorkout}
        style={{
          padding: 15,
          backgroundColor: "#6200ee",
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Add Workout</Text>
      </TouchableOpacity>
    </View>
  );
}
