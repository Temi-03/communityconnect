import { useState } from "react";
import {View,Text,TextInput,Pressable,StyleSheet,ActivityIndicator,KeyboardAvoidingView,Platform,ScrollView,} from "react-native";
import { Stack, router } from "expo-router";
import { auth } from "../../firebase";
import { getUser } from "../../services/userService";
import { createNotice } from "../../services/noticeService";

export default function CreateNotice() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePost() {
    try {
      setError("");
      setLoading(true);

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No logged-in user.");
      const clean = text.trim();
      if (!clean) throw new Error("Please type something.");
      const me = await getUser(uid);
      const username = me?.username;
      if (!username) throw new Error("No username found.");

      await createNotice({
        userId: uid,
        username,
        location:me.location,
        info: clean,
      });

      router.back();
    } catch (e: any) {
      setError(e?.message || "Failed to post notice.");
      console.log("CREATE NOTICE ERROR:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Stack.Screen options={{ title: "Post Notice", headerTitleAlign: "center" }} />

          <Text style={styles.title}>Post Notice</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type your notice..."
            placeholderTextColor="#e8ab55"
            multiline
            style={[styles.input, { height: 140, textAlignVertical: "top" }]}
          />

          <Pressable
            onPress={handlePost}
            disabled={loading}
            style={[styles.postBtn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  formContainer: {
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "#111",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    color: "#111",
  },

  postBtn: {
    backgroundColor: "#3D8D34",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 14,
  },

  postBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  cancelText: {
    color: "#555",
    fontWeight: "700",
  },

  error: {
    color: "crimson",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "700",
  },
});