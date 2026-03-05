import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { auth } from "../../firebase";
import { listenMessages, sendMessage } from "../../services/chatService";
import { getUser } from "../../services/userService";

export default function ChatThread() {
  const { chatId, otherName, otherUid } = useLocalSearchParams();

  const id = String(chatId ?? "");
  const [name, setName] = useState(String(otherName ?? ""));
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    async function loadName() {
      if (name) return;
      if (!otherUid) return;
      try {
        const u: any = await getUser(String(otherUid));
        setName(u?.username ?? "User");
      } catch (e) {
        setName("User");
      }
    }
    loadName();
  }, [otherUid, name]);

  
  useEffect(() => {
    if (!id) return;
    const unsub = listenMessages(id, setMessages);
    return () => unsub();
  }, [id]);

  function formatDateTime(ts: any) {
    if (!ts) return "";

    const d = ts.toDate ? ts.toDate() : new Date(ts);

    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${hours}:${minutes}`;
  }

  async function onSend() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const msg = text.trim();
    if (!msg) return;

    setText("");
    await sendMessage(id, uid, msg);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen
        options={{
          title: name || "Chat",
          headerTitleAlign: "center",
        }}
      />

      
      <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40, 
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  }}
>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#3D8D34",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>
            {String(name || "U").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View>
          <Text style={{ fontWeight: "900", fontSize: 16 }}>
            {name || "User"}
          </Text>
          <Text style={{ color: "#777", fontSize: 12 }}>
            Community Connect Chat
          </Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 90,
          paddingTop: 16,
          gap: 12,
        }}
        renderItem={({ item }) => {
          const mine = item.senderId === auth.currentUser?.uid;

          return (
            <View
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "80%",
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: mine ? "#3D8D34" : "#eee",
              }}
            >
              <Text
                style={{
                  color: mine ? "white" : "#111",
                  fontWeight: "700",
                }}
              >
                {item.text}
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: "700",
                  color: mine ? "#ffffffcc" : "#777",
                  alignSelf: "flex-end",
                }}
              >
                {formatDateTime(item.createdAt)}
              </Text>
            </View>
          );
        }}
      />

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 12,
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "white",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor="#999"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: "#111",
          }}
        />
        <Pressable
          onPress={onSend}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: "#3D8D34",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}