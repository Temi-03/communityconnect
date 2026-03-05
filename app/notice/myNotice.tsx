import { useEffect, useState } from "react";
import {View,Text,FlatList,Pressable,ActivityIndicator,StyleSheet,} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { auth } from "../../firebase";
import { getMyNotices, deleteNotice } from "../../services/noticeService";

function formatWhen(createdAt: any) {
  if (!createdAt) return "";
  const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function MyNotices() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);
      const uid = auth.currentUser?.uid;
      const data = await getMyNotices(uid);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.log("GET MY NOTICES ERROR:", e);
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotice(id);
      setRows((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.log("DELETE NOTICE ERROR:", e);
    }
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <FontAwesome name="chevron-left" size={20} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>My Notices</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Pressable onPress={load} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>

        {loading ? (
          <View style={{ paddingTop: 10 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Loading your notices...</Text>
          </View>
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : rows.length === 0 ? (
          <Text>You haven’t posted any notices yet.</Text>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => String(item?.id)}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.username}>{item?.username || ""}</Text>
                    <Text style={styles.time}>{formatWhen(item?.createdAt)}</Text>
                  </View>
                  <Pressable onPress={() => handleDelete(item.id)}>
                    <FontAwesome name="trash" size={18} color="#d11" />
                  </Pressable>
                </View>
                <Text style={styles.noticeText}>{item?.information || ""}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#e09020b7",
    paddingTop: 45,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },

  headerBtn: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 44,
  },

 
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 105, 
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

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  username: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },

  time: {
    fontSize: 12,
    color: "#777",
  },

  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
});