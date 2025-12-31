import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { SessionRepo } from '@/database/sessionRepo';

export default function SplitDetail() {
  const { splitId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [splitName, setSplitName] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, [splitId]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const sessions = await SessionRepo.getBySplitId(Number(splitId));
      setWorkouts(sessions);

      // Get split name from first workout if available
      if (sessions.length > 0) {
        setSplitName((sessions[0] as any).split_name || `Split ${splitId}`);
      } else {
        setSplitName(`Split ${splitId}`);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutIcon = (workoutName: string) => {
    const name = workoutName.toLowerCase();
    if (name.includes('chest')) return 'barbell-outline';
    if (name.includes('back')) return 'body-outline';
    if (name.includes('legs') || name.includes('quad')) return 'walk-outline';
    if (name.includes('shoulder')) return 'man-outline';
    if (name.includes('arm') || name.includes('bicep') || name.includes('tricep')) return 'fitness-outline';
    return 'barbell-outline';
  };

  const renderWorkoutCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/workout/${item.id}`)}
      style={[{
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        backgroundColor: colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,        shadowRadius: 8,
        elevation: 8,
      }]}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4
          }}>
            {item.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.icon,
            marginBottom: 8
          }}>
            {item.exercise_count || 0} exercises
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.icon
          }}>
            Last completed: {item.last_completed ? new Date(item.last_completed).toLocaleDateString() : 'Never'}
          </Text>
        </View>
        <Ionicons
          name={getWorkoutIcon(item.name)}
          size={32}
          color={colors.primary}
          style={{ opacity: 0.9 }}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 60
    }}>
      <Ionicons
        name="barbell-outline"
        size={80}
        color={colors.icon}
        style={{ marginBottom: 20, opacity: 0.5 }}
      />
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center'
      }}>
        No Workouts Yet
      </Text>
      <Text style={{
        fontSize: 14,
        color: colors.icon,
        textAlign: 'center',
        marginBottom: 30
      }}>
        Create your first workout to get started with this split
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: colors.text
        }}>
          Loading workouts...
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background
    }}>
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 15,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text
          }}>
            {splitName}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.icon,
            marginTop: 2
          }}>
            {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {workouts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWorkoutCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        <TouchableOpacity
          onPress={() => router.push("/workout/create")}
          style={{
            position: "absolute",
            bottom: 30,
            right: 30,
            backgroundColor: colors.primary,
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
