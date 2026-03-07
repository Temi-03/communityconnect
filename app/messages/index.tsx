import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { auth, db } from "../../firebase";
import { listenMyChats } from "../../services/chatService";
import { doc, getDoc } from "firebase/firestore";

export default function MessagesInbox() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameM, setNameM] = useState<Record<string, string>>({});

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsub = listenMyChats(uid, (rows: any[]) => {
      setChats(rows);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const myUid = auth.currentUser?.uid;
    if (!myUid || chats.length === 0) return;

    (async () => {
      const updates: Record<string, string> = {};

      for (const chat of chats) {
        const participants = chat.participants || [];
        const otherUid = participants.find((u: string) => u !== myUid);

        if (!otherUid) continue;
        if (nameM[otherUid]) continue;

        try {
          const snap = await getDoc(doc(db, "users", otherUid));
          if (snap.exists()) {
            const data: any = snap.data();
            updates[otherUid] = data.username || "User";
          } else {
            updates[otherUid] = "User";
          }
        } catch {
          updates[otherUid] = "User";
        }
      }

      if (Object.keys(updates).length > 0) {
        setNameM((prev) => ({ ...prev, ...updates }));
      }
    })();
  }, [chats]);

  function otherName(chat: any) {
    const myUid = auth.currentUser?.uid;
    const participants = chat.participants || [];
    const otherUid = participants.find((u: string) => u !== myUid);
    if (!otherUid) return "User";
    return nameM[otherUid] || "User";
  }

  return (
    <View style={styles.screen}>

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={18} color="white" />
        </Pressable>

        <Text style={styles.headerTitle}>Messages</Text>

        <View style={styles.rightSpacer} />
      </View>

      {loading ? (
        <View style={{ paddingTop: 10, paddingHorizontal: 16 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <Text style={{ fontWeight: "800" }}>No chats yet.</Text>
          <Text style={{ opacity: 0.6, marginTop: 6 }}>
            Chats appear when a volunteer is approved.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 16,
            gap: 12,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/messages/[chatId]",
                  params: {
                    chatId: item.id,
                    otherName: otherName(item),
                    taskId: item.taskId || "",
                  },
                })
              }
              style={styles.card}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{otherName(item)}</Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {item.lastMessage ? item.lastMessage : "Say hi"}
                  </Text>
                </View>

                {item.taskId ? (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/task/[taskId]",
                        params: { taskId: item.taskId },
                      })
                    }
                    style={styles.taskBtn}
                  >
                    <Text style={styles.taskBtnText}>Task</Text>
                  </Pressable>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },

  header: {
    backgroundColor: "#e8ab55",
    paddingTop: 43, 
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  rightSpacer: {
    width: 44,
  },

  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  name: {
    fontWeight: "900",
    fontSize: 16,
    color: "#111",
  },
  preview: {
    marginTop: 6,
    color: "#666",
    fontWeight: "700",
  },
  taskBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e8ab55",
  },
  taskBtnText: {
    color: "#e8ab55",
    fontWeight: "900",
  },
});