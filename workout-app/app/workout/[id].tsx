import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseRepo } from "@/database/exerciseRepo";
import { SetRepo } from "@/database/setRepo";
import { SessionRepo } from "@/database/sessionRepo";
import Timer from "@/components/Timer";
import { LinearGradient } from 'expo-linear-gradient';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutSet {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export default function LiveWorkout() {
  const { workoutId } = useLocalSearchParams();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [restTime, setRestTime] = useState(60);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadWorkoutData();
  }, [workoutId]);

  const loadWorkoutData = async () => {
    try {
      // Load exercises for this session
      const exercisesData = await ExerciseRepo.getBySessionId(Number(workoutId)) as Exercise[];
      setExercises(exercisesData);

      // Load existing sets or create them if they don't exist
      const existingSets = await SetRepo.getBySessionId(Number(workoutId)) as WorkoutSet[];

      if (existingSets.length === 0) {
        // Create sets for each exercise
        const newSets: WorkoutSet[] = [];
        for (const exercise of exercisesData) {
          for (let i = 0; i < exercise.sets; i++) {
            const setId = await SetRepo.create(
              Number(workoutId),
              exercise.id,
              exercise.weight,
              exercise.reps,
              false
            );
            newSets.push({
              id: setId,
              exercise_id: exercise.id,
              weight: exercise.weight,
              reps: exercise.reps,
              completed: false,
            });
          }
        }
        setSets(newSets);
      } else {
        setSets(existingSets);
      }

      // Get session rest time
      const sessionData = await SessionRepo.getAll() as any[];
      const currentSession = sessionData.find(s => s.id === Number(workoutId));
      if (currentSession) {
        setRestTime(currentSession.rest_time || 60);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load workout data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateSet = async (setId: number, weight: number, reps: number, completed: boolean) => {
    try {
      await SetRepo.update(setId, weight, reps, completed);
      setSets(prev =>
        prev.map(set =>
          set.id === setId
            ? { ...set, weight, reps, completed }
            : set
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update set");
      console.error(error);
    }
  };

  const completeSet = (setId: number) => {
    const set = sets.find(s => s.id === setId);
    if (set) {
      updateSet(setId, set.weight, set.reps, true);
      // Show timer for rest
      const exercise = exercises.find(e => e.id === set.exercise_id);
      if (exercise) {
        setCurrentExercise(exercise);
        setShowTimer(true);
      }
    }
  };

  const finishWorkout = async () => {
    try {
      await SessionRepo.update(
        Number(workoutId),
        "", // notes
        new Date().toISOString() // end_time
      );
      Alert.alert("Success", "Workout completed!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to finish workout");
      console.error(error);
    }
  };

  const renderExercise = ({ item: exercise }: { item: Exercise }) => {
    const exerciseSets = sets.filter(set => set.exercise_id === exercise.id);
    const completedSets = exerciseSets.filter(set => set.completed).length;

    return (
      <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={styles.exerciseHeader}
        >
          <View style={styles.exerciseTitleContainer}>
            <Ionicons name="barbell" size={24} color="#fff" />
            <Text style={[styles.exerciseName, { color: '#fff' }]}>{exercise.name}</Text>
          </View>
          <Text style={[styles.setCount, { color: 'rgba(255,255,255,0.8)' }]}>
            {completedSets}/{exercise.sets}
          </Text>
        </LinearGradient>

        <View style={styles.setsContainer}>
          {exerciseSets.map((set, index) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={[styles.setNumber, { color: colors.icon }]}>
                Set {index + 1}
              </Text>

              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <TextInput
                    value={set.weight.toString()}
                    onChangeText={(value) => {
                      const weight = parseFloat(value) || 0;
                      updateSet(set.id, weight, set.reps, set.completed);
                    }}
                    keyboardType="numeric"
                    style={[styles.input, { color: colors.text }]}
                    placeholder="kg"
                    placeholderTextColor={colors.icon}
                  />
                </View>

                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <TextInput
                    value={set.reps.toString()}
                    onChangeText={(value) => {
                      const reps = parseInt(value) || 0;
                      updateSet(set.id, set.weight, reps, set.completed);
                    }}
                    keyboardType="numeric"
                    style={[styles.input, { color: colors.text }]}
                    placeholder="reps"
                    placeholderTextColor={colors.icon}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => completeSet(set.id)}
                disabled={set.completed}
                style={[
                  styles.completeButton,
                  {
                    backgroundColor: set.completed ? colors.success : colors.primary,
                    opacity: set.completed ? 0.6 : 1
                  }
                ]}
              >
                <Ionicons
                  name={set.completed ? "checkmark" : "checkmark-circle"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading workout...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Live Workout</Text>
        <TouchableOpacity onPress={finishWorkout} style={styles.finishButton}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        </TouchableOpacity>
      </View>

      {showTimer && currentExercise && (
        <View style={[styles.timerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.timerHeader}>
            <Text style={[styles.timerTitle, { color: colors.text }]}>
              Rest after {currentExercise.name}
            </Text>
            <TouchableOpacity onPress={() => setShowTimer(false)}>
              <Ionicons name="close" size={24} color={colors.icon} />
            </TouchableOpacity>
          </View>
          <Timer
            initialTime={restTime}
            onComplete={() => setShowTimer(false)}
          />
        </View>
      )}

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExercise}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={finishWorkout}
          style={[styles.finishWorkoutButton, { backgroundColor: colors.success }]}
        >
          <LinearGradient
            colors={[colors.success, '#10B981']}
            style={styles.finishWorkoutGradient}
          >
            <Ionicons name="trophy" size={20} color="#fff" />
            <Text style={styles.finishWorkoutText}>Finish Workout</Text>
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
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  finishButton: {
    marginLeft: 16,
  },
  timerContainer: {
    margin: 20,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  exerciseCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  exerciseHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  setCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  setsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 60,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 16,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    fontSize: 16,
    textAlign: 'center',
  },
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    borderTopWidth: 1,
    padding: 20,
  },
  finishWorkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  finishWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  finishWorkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
});
