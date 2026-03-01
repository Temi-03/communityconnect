import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { getNotices } from "../../services/noticeService";
import { FontAwesome } from "@expo/vector-icons";

function formatWhen(createdAt: any) {
  if (!createdAt) return "";
  const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function NoticeBoard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotices() {
    try {
      setError("");
      setLoading(true);

      const data = await getNotices();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("GET NOTICES ERROR:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Notice Board",
          headerTitleAlign: "center",
          headerRight: () => (
            <Pressable onPress={() => router.push("/notice/create")} style={{ paddingHorizontal: 14 }}>
              <FontAwesome name="plus-circle" size={24} color="white" />
            </Pressable>
          ),
        }}
      />
      <Pressable onPress={loadNotices} style={styles.refreshButton} disabled={loading}>
        <Text style={styles.refreshText}>{loading ? "Refreshing..." : "Refresh"}</Text>
      </Pressable>

      {loading ? (
        <View style={{ paddingTop: 10 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading notices...</Text>
        </View>
      ) : error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : rows.length === 0 ? (
        <Text>No notices yet.</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item?.id)}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.username}>{item?.username || ""}</Text>
                <Text style={styles.time}>{formatWhen(item?.createdAt)}</Text>
              </View>

              <Text style={styles.noticeText}>{item?.information || ""}</Text>
            </View>
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