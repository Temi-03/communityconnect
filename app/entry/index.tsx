import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.title}>To</Text>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.title}> Connect</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.signUpButton}
          onPress={() => router.replace("/auth/signup")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </Pressable>
        <Text style={styles.questionText}>Already have an account?</Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8ab55",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  textContainer: {
    marginBottom: 60,
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "white",
    letterSpacing: 1,
  },

  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },

  signUpButton: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  signUpText: {
    color: "#e8ab55",
    fontSize: 16,
    fontWeight: "600",
  },

  questionText: {
    color: "white",
    marginBottom: 15,
    fontSize: 14,
  },

  loginButton: {
    borderWidth: 1.5,
    borderColor: "white",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
