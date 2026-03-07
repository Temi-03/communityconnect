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
          headerStyle: { backgroundColor: "#e8ab55" },
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
          <FontAwesome name="chevron-right" size={16} color="#999" style={styles.arrow} />
          <View style={[styles.iconBubble, { backgroundColor: "#e8ab55" }]}>
            <FontAwesome name="handshake-o" size={18} color="white" />
          </View>

          <Text style={styles.cardTitle}>I’m Volunteering</Text>
          <Text style={styles.cardSub}>
            View the tasks you have applied to and keep track of the volunteering work you have completed.
You can also see the status of your requests and manage your activity.
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/task/requester")} style={styles.card}>
          <FontAwesome name="chevron-right" size={16} color="#999" style={styles.arrow} />
          <View style={[styles.iconBubble, { backgroundColor: "#3D8D34" }]}>
            <FontAwesome name="tasks" size={18} color="white" />
          </View>

          <Text style={styles.cardTitle}>I’m Requesting Help</Text>
          <Text style={styles.cardSub}>
            <Text style={styles.cardSub}>
            Manage the tasks you have posted to the community. Review volunteer
            requests, approve helpers, and mark tasks as completed once the work
            is done.
          </Text>
          </Text>

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
    gap:40,
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
  cardSub: { marginTop: 8, color: "#666", fontWeight: "600", lineHeight: 22 },

  arrow: {
  position: "absolute",
  right: 16,
  top: 16,
},
});