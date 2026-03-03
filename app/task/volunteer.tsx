import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { router, Stack } from "expo-router";
import { auth } from "../../firebase";
import {getTasksForUser } from "../../services/taskService";
import{ getMyApplications} from "../../services/applicationService"

type TabKey = "applied" | "completed";

export default function VolunteerTasksScreen() {
  const [tab, setTab] = useState<TabKey>("applied");
  const [applied, setApplied] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadApplied() {
    try {
      setError("");
      setLoading(true);

      const uid = auth.currentUser?.uid;
      const apps = await getMyApplications(uid);
      setApplied(apps);
    } catch (e: any) {
      setError(e?.message || "Failed to load applied tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCompleted() {
    try {
      setError("");
      setLoading(true);

      const uid = auth.currentUser?.uid;
      const rows = await getTasksForUser(uid);

      const mine = rows.filter(
        (t) => t.status === "completed" && t.acceptedVolunteerUid === uid
      );

      setCompleted(mine);
    } catch (e: any) {
      setError(e?.message || "Failed to load completed tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (tab === "applied") return loadApplied();
    return loadCompleted();
  }

  useEffect(() => {
    loadApplied();
  }, []);

  useEffect(() => {
    if (tab === "completed" && completed.length === 0) loadCompleted();
    if (tab === "applied" && applied.length === 0) loadApplied();
  }, [tab]);

  function renderApplied() {
    if (applied.length === 0) return <Text style={styles.empty}>No applied tasks yet.</Text>;

    return (
      <View style={{ gap: 12 }}>
        {applied.map((a) => (
          <View key={a.id} style={styles.card}>
            <Text style={styles.cardTitle}>Task: {a.title || "Untitled Task"}</Text>
            <Text style={styles.cardMeta}>Status: {a.status || "—"}</Text>
            <Pressable
              onPress={() => router.push(`/task/${a.taskId}`)}
              style={styles.primaryButtons}
            >
              <Text style={styles.primaryButtonsText}>View Task</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  }

  function renderCompleted() {
    if (completed.length === 0) return <Text style={styles.empty}>No completed volunteering tasks yet.</Text>;

    return (
      <View style={{ gap: 12 }}>
        {completed.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardTitle}>{t.title || "Untitled Task"}</Text>
            <Text style={styles.cardMeta}>
              {(t.category || "—")} • {(t.location || "—")}
            </Text>

            <Pressable
              onPress={() => router.push(`/task/${t.id}`)}
              style={styles.outlineButtons}
            >
              <Text style={styles.outlineButtonsText}>Open</Text>
            </Pressable>

      
           <Pressable
            onPress={() => router.push(`/task/Buttons/${t.id}`)}
            style={styles.outlineButtons}
          >
            <Text style={styles.outlineButtonsText}>Leave Rating</Text>
          </Pressable>
          </View>
        ))}
      </View>
    );
  }

 return (
  <View style={styles.container}>
    <Stack.Screen
      options={{
        title: "Volunteering",
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#e09020b7" },
        headerTintColor: "white",
      }}
    />



    <View style={styles.tabRow}>
      <Pressable
        onPress={() => setTab("applied")}
        style={[styles.tabButtons, tab === "applied" && styles.tabButtonsActive]}
      >
        <Text style={[styles.tabText, tab === "applied" && styles.tabTextActive]}>
          Applied
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setTab("completed")}
        style={[styles.tabButtons, tab === "completed" && styles.tabButtonsActive]}
      >
        <Text style={[styles.tabText, tab === "completed" && styles.tabTextActive]}>
          Completed
        </Text>
      </Pressable>
    </View>

    <Pressable onPress={refresh} style={styles.refreshButtons}>
      <Text style={styles.refreshText}>Refresh</Text>
    </Pressable>

    <ScrollView
      style={styles.listArea}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <View style={{ marginTop: 18 }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={{ marginTop: 12 }}>
          {tab === "applied" ? renderApplied() : renderCompleted()}
        </View>
      )}
    </ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16, paddingTop: 40 },

  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tabButtons: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor:"#e09020b7",
    borderRadius: 10,
    alignItems: "center",
  },
  tabButtonsActive: { backgroundColor:"#3D8D34", borderColor:"#3D8D34" },
  tabText: { fontWeight: "800", color:"#e09020b7" },
  tabTextActive: { color: "white" },

  refreshButtons: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor:"#3D8D34",
  },
  refreshText: { color: "white", fontWeight: "900" },

  error: { marginTop: 14, color: "crimson", fontWeight: "900" },
  empty: { marginTop: 14, color: "#666", fontWeight: "700" },

  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "white",
  },
  cardTitle: { fontWeight: "900", color: "#111" },
  cardMeta: { marginTop: 4, color: "#666", fontWeight: "600" },

  primaryButtons: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor:"#3D8D34",
    alignItems: "center",
  },
  primaryButtonsText: { color: "white", fontWeight: "900" },

  outlineButtons: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:"#e09020b7",
    alignItems: "center",
    backgroundColor: "white",
  },
  outlineButtonsText: { color:"#e09020b7", fontWeight: "900" },
  topSpacer: { height: 18 },

listArea: { flex: 1, marginTop: 6 },

listContent: { paddingBottom: 40 },
});