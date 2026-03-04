import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, FlatList, StyleSheet} from "react-native";
import { router, Tabs } from "expo-router";
import { auth } from "../../firebase";
import { getOpenTasks } from "../../services/taskService";
import { FontAwesome } from "@expo/vector-icons";
import { getUser } from "../../services/userService";
function formatDateTime(ts: any) {
  if (!ts) return "—";
  
    const date = ts.toDate();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function BrowseTasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState("");

  async function loadTasks() {
    try {
      setError("");
      setLoading(true);

      const uid = auth.currentUser?.uid;
      const openTasks = await getOpenTasks(uid);
      const user = await getUser(uid) as any;
      setUserLocation(user.location);
      setTasks(openTasks);
    } catch (err: any) {
        setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <View style={styles.container}>
      <Tabs.Screen
        options={{
          headerTitle: "Community Connect",
          headerTitleAlign: "center",
          headerRight: () => (
            <Pressable onPress={() => router.push("/task/createTask")} style={{ paddingHorizontal: 20 }}>
              <FontAwesome name="plus-circle" size={24} color="white" />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.push("/messages")} style={{ paddingHorizontal: 20 }}>
              <FontAwesome name="comments-o" size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      <Text style={styles.pageTitle}>Available Tasks</Text>

      <View style={styles.topRow}>
        <Pressable onPress={loadTasks} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
        <View style={styles.locationRow}>
          <FontAwesome name="map-marker" size={16} color="#3d8d34" />
          <Text style={styles.locationText}>
            {userLocation || "No location"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingTop: 10 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading tasks…</Text>
        </View>
      ) : error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : tasks.length === 0 ? (
        <Text>No open tasks right now.</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item: t }) => (
            <Pressable
              onPress={() => router.push(`/task/${t.id}`)}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{t.title}</Text>
              <Text style={styles.cardMeta}>{t.location}</Text>
              {t.dueAt && (<Text style={styles.cardDue}>Due: {formatDateTime(t.dueAt)}</Text>
            )}         
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#3d8d34",
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  refreshText: {
    color: "white",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  cardMeta: {
    color: "#666",
    marginTop: 4,
  },

  cardDue: {
    color: "#2f7d32",
    marginTop: 4,
    fontWeight: "600",
  },

  viewButton: {
    marginTop: 10,
    backgroundColor: "#3d8d34",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },

  viewButtonText: {
    color: "white",
    fontWeight: "600",
  },
  topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
},
locationRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},
locationText: {
  fontWeight: "600",
  color: "#333",
},
});
