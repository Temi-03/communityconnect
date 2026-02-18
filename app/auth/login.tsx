import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { getUser } from "../../services/userService";
import { router } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setError("");
      setLoading(true);

      if (!email.trim()) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");
      


      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log("LOGGED IN:", userCred.user.uid);

      const profile = await getUser(userCred.user.uid);
      if (!profile) {
        console.log("No profile doc found for this user.");
            } 
    else {
        console.log("USER PROFILE:", profile);
}
      router.replace("/)"); 
    } catch (e) {
      setError(e?.message || "Login failed.");
      console.log("LOGIN ERROR:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>Log In</Text>

      {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text>Password</Text>
      <TextInput
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Logging in..." : "Log In"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
