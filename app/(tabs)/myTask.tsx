import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function MyTasksMenuScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "My Tasks",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#e09020b7" },
          headerTintColor: "white",
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Choose what you want to manage</Text>
        <Text style={styles.subtitle}>
          Pick a section below to view your tasks.
        </Text>
      </View>

      <View style={styles.cardsWrap}>
        <Pressable onPress={() => router.push("/task/volunteer")} style={styles.card}>
          <View style={[styles.iconBubble, { backgroundColor: "#e09020b7" }]}>
            <FontAwesome name="handshake-o" size={18} color="white" />
          </View>

          <Text style={styles.cardTitle}>I’m Volunteering</Text>
          <Text style={styles.cardSub}>
            View tasks you applied to and your completed volunteering tasks.
          </Text>

          <View style={styles.spacer} />

          <View style={[styles.cardButton, { backgroundColor: "#e09020b7" }]}>
            <Text style={styles.cardButtonText}>Open</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => router.push("/task/requester")} style={styles.card}>
          <View style={[styles.iconBubble, { backgroundColor: "#3D8D34" }]}>
            <FontAwesome name="tasks" size={18} color="white" />
          </View>

          <Text style={styles.cardTitle}>I’m Requesting Help</Text>
          <Text style={styles.cardSub}>
            View your posted tasks, approve requests, and mark tasks completed.
          </Text>

          <View style={styles.spacer} />

          <View style={[styles.cardButton, { backgroundColor: "#3D8D34" }]}>
            <Text style={styles.cardButtonText}>Open</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },

  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "800", color: "#111" },
  subtitle: { marginTop: 6, color: "#666", fontWeight: "600" },

  cardsWrap: {
    flex: 1,
    gap: 14,
  },

  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "white",
  },

  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  cardTitle: { fontSize: 20, fontWeight: "900", color: "#111" },
  cardSub: { marginTop: 8, color: "#666", fontWeight: "600", lineHeight: 20 },

  spacer: { flex: 1 },

  cardButton: {
    marginTop: 14,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  cardButtonText: { color: "white", fontWeight: "900", fontSize: 15 },
});