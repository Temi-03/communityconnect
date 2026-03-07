import React, { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase";


export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);

  async function resend() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Not logged in. Please log in again.");
        router.replace("/auth/login");
        return;
      }
      await sendEmailVerification(user);
      Alert.alert("Sent", "Check inbox/spam.");
    } catch (e: any) {
  if (e?.code === "auth/too-many-requests") {
    Alert.alert("Try again later", "Too many requests. Please try again later.");
  } else {
    Alert.alert("Error", e?.message || "Could not resend verification email.");
  }
}finally{
  setLoading(false)
}
  }

  async function iveVerified() {
  try {
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Not logged in. Please log in again.");
      router.replace("/auth/login");
      return;
    }

    await user.reload();

    if (!user.emailVerified) {
      Alert.alert("Not verified yet", "Open the verification email link first, then try again.");
      return;
    }
    await user.getIdToken(true);
    router.replace("/(tabs)/home");
  } catch (e: any) {
    Alert.alert("Error", e?.message || "Could not verify. Try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.text}>
        We sent a verification link to your email. Click it, then come back and tap “I verified”.
      </Text>

      <Pressable style={styles.buttonOutline} onPress={resend} disabled={loading}>
        <Text style={styles.buttonOutlineText}>{loading ? "..." : "Resend email"}</Text>
      </Pressable>

      <Pressable style={styles.buttonSolid} onPress={iveVerified} disabled={loading}>
        <Text style={styles.buttonSolidText}>{loading ? "Checking..." : "I verified"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#e8ab55" },
  title: { fontSize: 26, fontWeight: "700", color: "white", marginBottom: 10 },
  text: { color: "white", marginBottom: 18, lineHeight: 20 },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: "white",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonOutlineText: { color: "white", fontWeight: "700" },
  buttonSolid: {
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonSolidText: { color: "#e8ab55", fontWeight: "700" },
});