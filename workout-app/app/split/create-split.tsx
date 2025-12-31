import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, FlatList, ListRenderItemInfo } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { SplitRepo } from "@/database/splitRepo";
import { SessionRepo } from "@/database/sessionRepo";
import { ExerciseRepo } from "@/database/exerciseRepo";
import { SetRepo } from "@/database/setRepo";

interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  notes: string;
}

export default function CreateSplit() {
  const [splitName, setSplitName] = useState("");
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      name: `Day ${workoutDays.length + 1}`,
      exercises: []
    };
    setWorkoutDays([...workoutDays, newDay]);
  };

  const updateDayName = (dayId: string, name: string) => {
    setWorkoutDays(workoutDays.map(day =>
      day.id === dayId ? { ...day, name } : day
    ));
  };

  const addExercise = (dayId: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      notes: ""
    };

    setWorkoutDays(workoutDays.map(day =>
      day.id === dayId
        ? { ...day, exercises: [...day.exercises, newExercise] }
        : day
    ));
  };

  const updateExercise = (dayId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setWorkoutDays(workoutDays.map(day =>
      day.id === dayId
        ? {
            ...day,
            exercises: day.exercises.map(ex =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            )
          }
        : day
    ));
  };

  const removeExercise = (dayId: string, exerciseId: string) => {
    setWorkoutDays(workoutDays.map(day =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
        : day
    ));
  };

  const removeDay = (dayId: string) => {
    setWorkoutDays(workoutDays.filter(day => day.id !== dayId));
  };

  const createSplit = async () => {
    if (!splitName.trim()) return Alert.alert("Error", "Please enter a split name");
    if (workoutDays.length === 0) return Alert.alert("Error", "Please add at least one workout day");

    try {
      // Create the split
      const splitId = await SplitRepo.create(splitName.trim(), "");

      // Create sessions (workout days) and their exercises
      for (const day of workoutDays) {
        const sessionId = await SessionRepo.create(splitId, "", 60); // splitId, notes, restTime

        for (const exercise of day.exercises) {
          if (exercise.name.trim()) {
            const exerciseId = await ExerciseRepo.create(exercise.name.trim(), sessionId);

            // Create sets for each exercise
            for (let i = 0; i < exercise.sets; i++) {
              await SetRepo.create(sessionId, exerciseId, exercise.weight, exercise.reps, false); // sessionId, exerciseId, weight, reps, completed
            }
          }
        }
      }

      Alert.alert("Success", "Split created successfully!");
      router.back();
    } catch (error) {
      console.error("Error creating split:", error);
      Alert.alert("Error", "Failed to create split");
    }
  };

  const renderWorkoutDay = ({ item, index }: ListRenderItemInfo<WorkoutDay>) => {
    const day = item;
    const renderExercise = ({ item: exercise, index }: ListRenderItemInfo<Exercise>) => (
      <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.exerciseHeader}>
          <TextInput
            placeholder="Exercise name"
            placeholderTextColor={colors.icon}
            value={exercise.name}
            onChangeText={(text) => updateExercise(day.id, exercise.id, { name: text })}
            style={[styles.exerciseNameInput, { color: colors.text }]}
          />
          <TouchableOpacity
            onPress={() => removeExercise(day.id, exercise.id)}
            style={styles.removeButton}
          >
            <Ionicons name="trash" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Sets</Text>
              <TextInput
                value={exercise.sets.toString()}
                onChangeText={(text) => updateExercise(day.id, exercise.id, { sets: parseInt(text) || 1 })}
                style={[styles.detailInput, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Reps</Text>
              <TextInput
                value={exercise.reps.toString()}
                onChangeText={(text) => updateExercise(day.id, exercise.id, { reps: parseInt(text) || 1 })}
                style={[styles.detailInput, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Weight (lbs)</Text>
              <TextInput
                value={exercise.weight.toString()}
                onChangeText={(text) => updateExercise(day.id, exercise.id, { weight: parseFloat(text) || 0 })}
                style={[styles.detailInput, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Rest (sec)</Text>
              <TextInput
                value={exercise.restTime.toString()}
                onChangeText={(text) => updateExercise(day.id, exercise.id, { restTime: parseInt(text) || 60 })}
                style={[styles.detailInput, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TextInput
            placeholder="Notes (optional)"
            placeholderTextColor={colors.icon}
            value={exercise.notes}
            onChangeText={(text) => updateExercise(day.id, exercise.id, { notes: text })}
            style={[styles.notesInput, { color: colors.text, borderColor: colors.border }]}
            multiline
          />
        </View>
      </View>
    );

    return (
      <View style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.dayHeader}>
          <TextInput
            value={day.name}
            onChangeText={(text) => updateDayName(day.id, text)}
            style={[styles.dayNameInput, { color: colors.text }]}
          />
          <TouchableOpacity onPress={() => removeDay(day.id)} style={styles.removeButton}>
            <Ionicons name="trash" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={day.exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.icon }]}>No exercises added yet</Text>
          }
        />

        <TouchableOpacity
          onPress={() => addExercise(day.id)}
          style={[styles.addExerciseButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.background }]}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Create Split</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>Design your workout program</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="fitness" size={24} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              placeholder="Split Name"
              placeholderTextColor={colors.icon}
              value={splitName}
              onChangeText={setSplitName}
              style={[styles.input, { color: colors.text }]}
              autoFocus
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Days</Text>
            <TouchableOpacity
              onPress={addWorkoutDay}
              style={[styles.addDayButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={workoutDays}
            renderItem={renderWorkoutDay}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="calendar" size={48} color={colors.icon} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No workout days yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.icon }]}>Add your first workout day to get started</Text>
              </View>
            }
          />

          <TouchableOpacity
            onPress={createSplit}
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            disabled={workoutDays.length === 0}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Split</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
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
  scrollContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addDayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dayCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayNameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  removeButton: {
    padding: 8,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  exerciseDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    minHeight: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  addExerciseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
