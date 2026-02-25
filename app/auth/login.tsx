import { useState } from "react";
import {View,Text,TextInput,Pressable,StyleSheet} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { router } from "expo-router";
import { registerForPushNotifications } from "../../services/notificationService";
import { savePushToken } from "../../services/userService";

export default function Login() { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
//REMBER TO DO ACUTAL EMAIL VALIDATION tEMIIII
  async function handleLogin() {
    try {
      setError(""); // Clear previous errors
      setLoading(true); // Set loading state to true to indicate that the login process has started

      if (!email.trim()) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");

      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log("LOGGED IN:", userCred.user.uid);
        // After successful login, we register for push notifications and save the token to the user document, so that we can send push notifications to the user later
      try {
        const token = await registerForPushNotifications();
        if (token) await savePushToken(userCred.user.uid, token);
          } catch (err: any) {
            console.log("Push token not saved:", err?.message || err);
      }
      
      router.replace("/(tabs)/home");

    } 
  catch (err: any) {
    if (err?.code === "auth/invalid-email") {
      setError("Please enter a valid email.");} 
    else if (err?.code === "auth/invalid-credential") {
      setError("Incorrect email or password.");} 
    else {
      setError(err?.message || "Login failed."); }
  }
    finally {
      setLoading(false); //disables the loading state after the login attempt is finished, regardless of success or failure
    }
  }

  return (
      <View style={styles.container}>
      <View style={styles.textContainer}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.title}>Back</Text>
        </View>
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#e09020"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#e09020"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "Logging in..." : "Log In"}
            </Text>
          </Pressable>

          <Text style={styles.questionText}>Don’t have an account?</Text>

          <Pressable
            style={styles.signUpButton}
            onPress={() => router.push("/auth/signup")}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </Pressable>
        </View>
      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e09020b7",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  textContainer: {
    marginBottom: 40,
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "white",
    letterSpacing: 1,
  },

  formContainer: {
    width: "100%",
    alignItems: "center",
  },

  errorText: {
    color: "white",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 15,
    color: "#e09020",
  },

  loginButton: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  loginText: {
    color: "#e09020",
    fontSize: 16,
    fontWeight: "600",
  },

  questionText: {
    color: "white",
    marginBottom: 15,
    fontSize: 14,
  },

  signUpButton: {
    borderWidth: 1.5,
    borderColor: "white",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  signUpText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
}); 