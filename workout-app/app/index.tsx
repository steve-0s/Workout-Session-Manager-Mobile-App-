import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { SplitRepo } from "@/database/splitRepo";

interface Split {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function HomeScreen() {
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadSplits();
  }, []);

  const loadSplits = async () => {
    console.log('loadSplits called');
    try {
      const data = await SplitRepo.getAll() as Split[];
      console.log('loadSplits data:', data);
      setSplits(data);
    } catch (error) {
      console.log('loadSplits error:', error);
      Alert.alert("Error", "Failed to load splits");
      console.error(error);
    } finally {
      console.log('loadSplits finally, setting loading to false');
      setLoading(false);
    }
  };

  const renderSplitCard = ({ item }: { item: Split }) => (
    <TouchableOpacity
      onPress={() => router.push(`/split/${item.id}` as any)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="fitness" size={32} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.splitName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.splitDescription, { color: colors.icon }]}>
            {item.description || "No description"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.icon} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading splits...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>My Workouts</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>Track your fitness journey</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.background }]}>
            <Ionicons name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {splits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell" size={64} color={colors.icon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No splits yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            Create your first workout split to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={splits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSplitCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/split/create-split")}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  splitName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  splitDescription: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
});
