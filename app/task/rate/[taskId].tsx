import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { auth } from "../../../firebase";
import { createStarRatingForTask, getMyRatingForTask } from "../../../services/ratingService";

;


export default function RateTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const uid = auth.currentUser?.uid;

  const [stars, setStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  async function checkExisting() {
    if (!taskId || !uid) return;
    const existing = await getMyRatingForTask(String(taskId), uid) as any
    if (existing) {
      setAlreadyRated(true);
      setStars(existing.stars||0);
    }
  }

  useEffect(() => {
    checkExisting();
  }, []);

  async function submit() {
    try {
      if (!taskId) throw new Error("Missing taskId.");
      if (!uid) throw new Error("You must be logged in.");
      if (stars < 1) throw new Error("Please select a star rating.");

      setSubmitting(true);
      await createStarRatingForTask(String(taskId), uid, stars);

      Alert.alert("Thanks!", "Your rating was submitted.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Rate Task",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor:"#e8ab55" },
          headerTintColor: "white",
        }}
      />

      <Text style={styles.title}>
        {alreadyRated ? "You already rated this task" : "Give a rating"}
      </Text>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => !alreadyRated && setStars(n)}
            disabled={alreadyRated}
            style={{ padding: 6 }}
          >
            <FontAwesome
            name={n <= stars ? "star" : "star-o"}
            size={36}
            color="#3D8D34"
          />
          </Pressable>
        ))}
      </View>

      {!alreadyRated ? (
        <Pressable
          onPress={submit}
          disabled={submitting}
          style={[styles.btn, submitting && { opacity: 0.6 }]}
        >
          <Text style={styles.btnText}>{submitting ? "Submitting…" : "Submit"}</Text>
        </Pressable>
      ) : (
        <Text style={styles.note}>Rating locked</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", textAlign: "center", marginBottom: 18, color: "#111" },
  starsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 22 },
  btn: { backgroundColor:"#3D8D34", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "white", fontWeight: "900", fontSize: 16 },
  note: { textAlign: "center", color: "#666", fontWeight: "700" },
});