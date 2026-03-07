import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { router, Stack } from "expo-router";
import { auth } from "../../firebase";
import {getMyPostedTasks,getTasksForUser,markTaskCompleted,} from "../../services/taskService";
import { buildChatId } from "../../services/chatService";
import { getPendingApplicationsForOwner,acceptApplication,rejectApplication } from "@/services/applicationService";
import { deleteTask } from "../../services/taskService";
import { Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type TabKey = "posted" | "requests" | "completed";

export default function RequesterTasksScreen() {
  const [tab, setTab] = useState<TabKey>("posted");
  const [posted, setPosted] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadPosted() {
    try {
      setError("");
      setLoading(true);
      const uid = auth.currentUser?.uid;;
      const rows = await getMyPostedTasks(uid);
      setPosted(rows);
    } catch (e: any) {
      setError(e?.message || "Failed to load posted tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRequests() {
    try {
      setError("");
      setLoading(true);
      const uid = auth.currentUser?.uid;
      const rows = await getPendingApplicationsForOwner(uid);
      setRequests(rows);
    } catch (e: any) {
      setError(e?.message || "Failed to load requests.");
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

      const mine = rows.filter((t) => t.status === "completed" && t.ownerUid === uid);
      setCompleted(mine);
    } catch (e: any) {
      setError(e?.message || "Failed to load completed tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (tab === "posted") return loadPosted();
    if (tab === "requests") return loadRequests();
    return loadCompleted();
  }


async function handleAccept(r: any) {
  try {
    const uid = auth.currentUser?.uid;;
    if (!r?.taskId || !r?.volunteerUid) {
      console.log("BAD APPLICATION:", r);
      throw new Error("Application missing taskId or volunteerUid.");
    }

    setActingId(r.id);

    await acceptApplication(r.id, uid);

    const chatId = buildChatId(r.taskId, uid, r.volunteerUid);
    router.push({
  pathname: `/messages/${chatId}`,
  params: { otherUid: r.volunteerUid },
});

    await loadRequests();
    await loadPosted();
  } catch (e:any) {
        console.log("Accept error:", e);
    setError(e.message || "Failed to accept request.");
    Alert.alert("Error", e.message || "Failed to accept request.");
  } finally {
    setActingId(null);
  }
}

async function handleDelete(taskId:any) {
  try {
    const res = await deleteTask(taskId);

    Alert.alert(
      "Task updated",
      res.action === "deleted"
        ? "Task deleted successfully."
        : "Task cancelled because volunteers had already applied."
    );

    await loadPosted(); 
  } catch (e:any) {
    Alert.alert("Error", e.message);
   }
}
  async function handleReject(appId: string) {
    try {
      const uid = auth.currentUser?.uid;
      setActingId(appId);
      await rejectApplication(appId, uid);
      setError(""); 
      await loadRequests();
    } catch (e: any) {
     setError(e?.message || "Failed to reject.");
    } finally {
      setActingId(null);
    }
  }

 async function handleMarkCompleted(taskId: string) {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await markTaskCompleted(taskId, uid);

    await loadPosted();
    await loadCompleted();
  } catch (e: any) {
    setError(e?.message || "Failed to complete task.");
  }
}

  useEffect(() => {
    loadPosted();
  }, []);

  useEffect(() => {
    if (tab === "requests" && requests.length === 0) loadRequests();
    if (tab === "completed" && completed.length === 0) loadCompleted();
    if (tab === "posted" && posted.length === 0) loadPosted();
  }, [tab]);

  function renderPosted() {
    if (posted.length === 0) return <Text style={styles.empty}>No tasks posted yet.</Text>;

    return (
      <View style={{ gap: 12 }}>
        {posted.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardTitle}>{t.title || "Untitled Task"}</Text>
            <Text style={styles.cardMeta}>
              {(t.location || "—")}
            </Text>
            <Text style={styles.cardMeta}>Status: {t.status || "—"}</Text>

            <Pressable
              onPress={() => router.push(`/task/${t.id}`)}
              style={styles.primaryButtons}
            >
              <Text style={styles.primaryButtonsText}>View Task</Text>
            </Pressable>
            {t.status === "open" && (
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Delete task?",
                    "If volunteers already applied, it will be cancelled instead of deleted.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Confirm", style: "destructive", onPress: () => handleDelete(t.id) },
                    ]
                  )
                }
                style={styles.deleteButtons}
              >
              <Text style={styles.deleteButtonsText}>Delete</Text>
              </Pressable>
            )}

            {t.status === "accepted" ? (
              <Pressable onPress={() => handleMarkCompleted(t.id)} style={styles.completeButtons}>
                <Text style={styles.completeButtonsText}>Mark as Completed</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  function renderRequests() {
    if (requests.length === 0) return <Text style={styles.empty}>No requests right now.</Text>;

    return (
      <View style={{ gap: 12 }}>
        {requests.map((r) => {
          const busy = actingId === r.id;

          return (
            <View key={r.id} style={styles.card}>
              <Text style={styles.cardTitle}>Task: {r.taskTitle || "Untitled Task"}</Text>
             <Text style={styles.cardMeta}>
                Volunteer: {r.volunteerName || "—"}  {r.volunteerRatingAvg ?? 0} 
                <FontAwesome name="star" size={16} color="#f5b301"  />
              </Text>
              <Text style={styles.cardMeta}>Status: {r.status || "pending"}</Text>

              <View style={styles.rowButtons}>
                <Pressable
                  onPress={() => handleAccept(r)}
                  disabled={busy}
                  style={[styles.acceptButtons, busy && { opacity: 0.6 }]}
                >
                  <Text style={styles.acceptText}>{busy ? "Working…" : "Accept"}</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleReject(r.id)}
                  disabled={busy}
                  style={[styles.rejectButtons, busy && { opacity: 0.6 }]}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  function renderCompleted() {
    if (completed.length === 0) return <Text style={styles.empty}>No completed tasks yet.</Text>;

    return (
      <View style={{ gap: 12 }}>
        {completed.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardTitle}>{t.title || "Untitled Task"}</Text>
            <Text style={styles.cardMeta}>
              {(t.category || "—")} • {(t.location || "—")}
            </Text>
            <Text style={styles.cardMeta}>Status: Completed</Text>

            <Pressable onPress={() => router.push(`/task/${t.id}`)} style={styles.outlineButtons}>
              <Text style={styles.outlineButtonsText}>Open</Text>
            </Pressable>

            
             <Pressable
              onPress={() => router.push(`/task/rate/${t.id}`)}
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
        title: "Requesting Help",
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#e09020b7" },
        headerTintColor: "white",
      }}
    />

   

    <View style={styles.tabRow}>
      <Pressable
        onPress={() => setTab("posted")}
        style={[styles.tabButtons, tab === "posted" && styles.tabButtonsActive]}
      >
        <Text style={[styles.tabText, tab === "posted" && styles.tabTextActive]}>My Posted</Text>
      </Pressable>

      <Pressable
        onPress={() => setTab("requests")}
        style={[styles.tabButtons, tab === "requests" && styles.tabButtonsActive]}
      >
        <Text style={[styles.tabText, tab === "requests" && styles.tabTextActive]}>Requests</Text>
      </Pressable>

      <Pressable
        onPress={() => setTab("completed")}
        style={[styles.tabButtons, tab === "completed" && styles.tabButtonsActive]}
      >
        <Text style={[styles.tabText, tab === "completed" && styles.tabTextActive]}>Completed</Text>
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
          {tab === "posted"
            ? renderPosted()
            : tab === "requests"
            ? renderRequests()
            : renderCompleted()}
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
  tabText: { fontWeight: "900", color:"#e09020b7", fontSize: 12 },
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

  rowButtons: { flexDirection: "row", gap: 10, marginTop: 12 },

  acceptButtons: {
    flex: 1,
    backgroundColor:"#3D8D34",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptText: { color: "white", fontWeight: "900" },

  rejectButtons: {
    flex: 1,
    borderWidth: 1,
    borderColor:"#e09020b7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "white",
  },
  rejectText: { color:"#e09020b7", fontWeight: "900" },

  primaryButtons: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor:"#3D8D34",
    alignItems: "center",
  },
  primaryButtonsText: { color: "white", fontWeight: "900" },

  completeButtons: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:"#e09020b7",
    alignItems: "center",
    backgroundColor: "white",
  },
  completeButtonsText: { color:"#e09020b7", fontWeight: "900" },

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

  listArea: { flex: 1, marginTop: 6 },
  listContent: { paddingBottom: 40 },
  deleteButtons: {
  marginTop: 10,
  paddingVertical: 10,
  borderRadius: 10,
  backgroundColor: "#d9534f",
  alignItems: "center",
},
deleteButtonsText: {
  color: "white",
  fontWeight: "900",
},
});