import React, { useEffect, useState } from "react";
import {View,Text,ActivityIndicator,Pressable,ScrollView,Alert,StyleSheet,} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { auth } from "../../firebase";
import {getTaskById,} from "../../services/taskService";
import { getUser } from "../../services/userService";
import {createApplication,getMyApplicationForTask} from "../../services/applicationService";
import { FontAwesome } from "@expo/vector-icons";

function formatDateTime(ts:any) {
  if (!ts) return "—";
  try {
    const date = ts.toDate();

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "—";
  }
}

function taskStatusLabel(status?: string) {
  if (!status) return "—";
  if (status === "open") return "Open";
  if (status === "accepted") return "Accepted";
  if (status === "completed") return "Completed";
  if (status === "closed") return "Closed";
  if (status === "cancelled") return "Cancelled";
  if (status === "deleted") return "Deleted";
  return status;
}

function appStatusLabel(status?: string) {
  if (!status) return "—";
  if (status === "pending") return "Pending Approval";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";
  
  return status;
}

function badgeStyleByType(type: "task" | "app", status?: string) {
  if (type === "app") {
    if (status === "pending") return [styles.badge, styles.badgePending];
    if (status === "accepted") return [styles.badge, styles.badgeAccepted];
    if (status === "rejected") return [styles.badge, styles.badgeRejected];
    return [styles.badge, styles.badgeNeutral];
  }

  if (status === "open") return [styles.badge, styles.badgeOpen];
  if (status === "accepted") return [styles.badge, styles.badgeAccepted];
  if (status === "completed") return [styles.badge, styles.badgeNeutral];
  if (status === "cancelled") return [styles.badge, styles.badgeCancelled];
  if (status === "deleted") return [styles.badge, styles.badgeDeleted];
  return [styles.badge, styles.badgeNeutral];
}

export default function TaskDetailsScreen() {
  const params = useLocalSearchParams();
  const rawId = (params as any).id; //get the task id for  {id}
  const taskId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [task, setTask] = useState<any | null>(null);
  const [myApp, setMyApp] = useState<any | null>(null);
  const [owner, setOwner] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      if (!taskId) throw new Error("Invalid task ID.");
      //load the task
      const t: any = await getTaskById(String(taskId));
      if (!t) throw new Error("Task not found.");
      setTask(t);

     //the person who created the task
      if (t.ownerUid) {
        const ownerData = await getUser(t.ownerUid);
        setOwner(ownerData);
      } else {
        setOwner(null);
      }
      //check if the user already applied for the task
      const uid = auth.currentUser?.uid;
      if (uid) {
        const app = await getMyApplicationForTask(String(taskId), uid);
        setMyApp(app);
      } else {
        setMyApp(null);
      }
    } catch (e: any) {
      console.log("Task details error:", e);
      setError(e?.message || "Failed to load task.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest() {
    try {
      const uid = auth.currentUser?.uid;
      if (!task?.id) throw new Error("Invalid task.");

      setRequesting(true);

      await createApplication(task.id, uid);

      Alert.alert("Sent", "Your request is pending approval.");
      await loadAll(); //make it load automatically
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to request.");
    } finally {
      setRequesting(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const myStatus = myApp?.status;
  

  const badgeType: "task" | "app" = myStatus ? "app" : "task";
  const badgeText =
    badgeType === "app" ? appStatusLabel(myStatus) : taskStatusLabel(task?.status);

  const infoRows = !task
  ? []
  : [
      { label: "Location", value: task.location || "—" },
      { label: "Due At", value: formatDateTime(task.dueAt) },
      { label: "Task Status", value: taskStatusLabel(task.status) },
    ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.centerText}>Loading task…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.containerFull}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!task) return null;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
    
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{task.title || "Untitled Task"}</Text>

        <View style={badgeStyleByType(badgeType, badgeType === "app" ? myStatus : task.status)}>
      
        <Text style={styles.badgeText}>{badgeText}</Text>
        </View>

        {myStatus ? (
          <Text style={styles.smallHint}>
            Your application: <Text style={{ fontWeight: "900" }}>{appStatusLabel(myStatus)}</Text>
          </Text>
        ) : null}

       
        {owner && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.ownerName}>{owner.username}</Text>
            <Text style={styles.ownerRating}>
              Rating: {owner.ratingAvg ?? "N/A"}
              <FontAwesome name="star" size={16} color="#f5b301"  />
            </Text>
          </View>
        )}
        {(task.status === "accepted" || task.status === "completed") && task.acceptedVolunteerUid ? (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.ownerName}>Volunteer</Text>
            <Text style={styles.ownerName}>
              {task.acceptedVolunteerName || "Unknown volunteer"}
            </Text>
            <Text style={styles.ownerRating}>
              Rating: {task.acceptedVolunteerRatingAvgAtAccept ?? 0} 
               <FontAwesome name="star" size={16} color="#f5b301"  />
            </Text>
          </View>
) : null}
      </View>

      <View style={styles.infoCard}>
        {infoRows.map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      
      <View style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descText}>
          {task.details || "-"}
        </Text>
      </View>

    
      <View style={{ marginTop: 6 }}>
  {task.status === "deleted" ? (
    <Text style={styles.helperText}>This task was deleted by the requester.</Text>
  ) : task.status === "cancelled" ? (
    <Text style={styles.helperText}>This task was cancelled by the requester.</Text>
  ) : task.status !== "open" ? (
    <Text style={styles.helperText}>This task is no longer open.</Text>
  ) : myStatus === "pending" ? (
    <Text style={styles.helperText}>Your request is pending approval.</Text>
  ) : myStatus === "accepted" ? (
    <Text style={styles.helperText}>You were accepted.</Text>
  ) : myStatus === "rejected" ? (
    <Text style={styles.helperText}>Your request was rejected.</Text>
  ) : (
    <Pressable
      onPress={handleRequest}
      disabled={requesting}
      style={[styles.primaryButtons, requesting && styles.primaryButtonsDisabled]}
    >
      <Text style={styles.primaryButtonsText}>
        {requesting ? "Sending…" : "Request to Volunteer"}
      </Text>
    </Pressable>
  )}
</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "white" },

  containerFull: { flex: 1, padding: 16, backgroundColor: "white" },

  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
    paddingTop: 60
  },

  headerBlock: {
    gap: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
  },

  centerText: {
    marginTop: 10,
    color: "#333",
    fontWeight: "600",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },

  smallHint: {
    color: "#666",
    fontWeight: "700",
  },

  ownerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  ownerRating: {
    fontSize: 14,
    color: "#666",
  },

  badge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },

  badgeOpen: {
    borderColor:"#3D8D34",
    backgroundColor: "rgba(61,141,52,0.12)",
  },
 
  badgePending: {
    borderColor:"#e09020b7",
    backgroundColor: "rgba(224,144,32,0.14)",
  },
  badgeAccepted: {
    borderColor:"#3D8D34",
    backgroundColor: "rgba(61,141,52,0.12)",
  },

  badgeNeutral: {
    borderColor: "#ddd",
    backgroundColor: "#f7f7f7",
  },

  badgeText: {
    fontWeight: "800",
    color: "#111",
  },

  infoCard: {
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  infoLabel: {
    color: "#666",
    fontWeight: "800",
  },

  infoValue: {
    color: "#111",
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },

  descriptionCard: {
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderRadius: 12,
    padding: 12,
  },

  sectionTitle: {
    fontWeight: "900",
    marginBottom: 6,
    color: "#111",
  },

  descText: {
    color: "#222",
    lineHeight: 20,
  },

  helperText: {
    color: "#666",
    fontWeight: "800",
  },

  primaryButtons: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor:"#3D8D34",
    alignItems: "center",
  },

  primaryButtonsDisabled: {
    opacity: 0.6,
  },

  primaryButtonsText: {
    color: "white",
    fontWeight: "900",
  },

  errorText: {
    color: "red",
    fontWeight: "800",
  },
  badgeCancelled: {
  borderColor: "crimson",
  backgroundColor: "rgba(220,20,60,0.10)",
},
badgeDeleted: {
  borderColor: "#999",
  backgroundColor: "#f0f0f0",
},
badgeRejected: {
  borderColor: "crimson",
  backgroundColor: "rgba(220,20,60,0.10)",
},
});
