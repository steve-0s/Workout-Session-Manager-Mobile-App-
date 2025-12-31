import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { SessionRepo } from "@/database/sessionRepo";
import { ExerciseRepo } from "@/database/exerciseRepo";
import { LinearGradient } from 'expo-linear-gradient';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function CreateWorkout() {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [restTime, setRestTime] = useState("60");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { splitId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const addExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      sets: parseInt(sets) || 3,
      reps: parseInt(reps) || 10,
      weight: parseFloat(weight) || 0,
    };

    setExercises([...exercises, newExercise]);
    setExerciseName("");
    setSets("3");
    setReps("10");
    setWeight("0");
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const saveWorkout = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a workout name");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    setSaving(true);
    try {
      // Create session
      const sessionId = await SessionRepo.create(
        parseInt(splitId as string),
        notes.trim(),
        parseInt(restTime) || 60
      );

      // Add exercises to session
      for (const exercise of exercises) {
        await ExerciseRepo.create(
          sessionId,
          exercise.name,
          exercise.sets,
          exercise.reps,
          exercise.weight
        );
      }

      Alert.alert("Success", "Workout created successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save workout");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
        <TouchableOpacity onPress={() => removeExercise(item.id)}>
          <Ionicons name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.exerciseDetails}>
        <Text style={[styles.exerciseDetail, { color: colors.icon }]}>
          {item.sets} sets × {item.reps} reps
        </Text>
        {item.weight > 0 && (
          <Text style={[styles.exerciseDetail, { color: colors.icon }]}>
            {item.weight} kg
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.background }]}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Create Workout</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>Build your training session</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Details</Text>

          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <Ionicons name="barbell" size={20} color={colors.icon} style={styles.inputIcon} />
            <TextInput
              placeholder="Workout Name"
              placeholderTextColor={colors.icon}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <Ionicons name="document-text" size={20} color={colors.icon} style={styles.inputIcon} />
            <TextInput
              placeholder="Notes (optional)"
              placeholderTextColor={colors.icon}
              value={notes}
              onChangeText={setNotes}
              multiline
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <Ionicons name="time" size={20} color={colors.icon} style={styles.inputIcon} />
            <TextInput
              placeholder="Rest time (seconds)"
              placeholderTextColor={colors.icon}
              value={restTime}
              onChangeText={setRestTime}
              keyboardType="numeric"
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Add Exercises</Text>

          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <Ionicons name="fitness" size={20} color={colors.icon} style={styles.inputIcon} />
            <TextInput
              placeholder="Exercise name"
              placeholderTextColor={colors.icon}
              value={exerciseName}
              onChangeText={setExerciseName}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={styles.exerciseInputs}>
            <View style={[styles.smallInputContainer, { borderColor: colors.border }]}>
              <TextInput
                placeholder="Sets"
                placeholderTextColor={colors.icon}
                value={sets}
                onChangeText={setSets}
                keyboardType="numeric"
                style={[styles.smallInput, { color: colors.text }]}
              />
            </View>
            <View style={[styles.smallInputContainer, { borderColor: colors.border }]}>
              <TextInput
                placeholder="Reps"
                placeholderTextColor={colors.icon}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                style={[styles.smallInput, { color: colors.text }]}
              />
            </View>
            <View style={[styles.smallInputContainer, { borderColor: colors.border }]}>
              <TextInput
                placeholder="Weight (kg)"
                placeholderTextColor={colors.icon}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                style={[styles.smallInput, { color: colors.text }]}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={addExercise}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {exercises.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Exercises ({exercises.length})
            </Text>
            <FlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              renderItem={renderExercise}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={saveWorkout}
          disabled={saving}
          style={[
            styles.saveButton,
            { backgroundColor: saving ? colors.icon : colors.success }
          ]}
        >
          <LinearGradient
            colors={saving ? [colors.icon, colors.icon] : [colors.success, '#10B981']}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Workout"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  exerciseInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  smallInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  smallInput: {
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseDetail: {
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    padding: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
