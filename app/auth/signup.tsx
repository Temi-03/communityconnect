import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { createUser } from "../../services/userService";
import { router } from "expo-router";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retrypassword, setretryPassword] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")

  async function handleSignup() {
    try {
      setError("");
      setLoading(true);

      
      if (!username.trim()) throw new Error("username is required.");
      if (!email.trim()) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");
      if(retrypassword !== password) throw new Error("Passwords do not match.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");


      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

       await createUser(userCred.user.uid, {
        username: username.trim(),
        email: email.trim(),
        location: location.trim() || null,
        bio: bio.trim() || null,
        
      });


      console.log("Signup successful!");

    
      router.replace("/"); 
    } catch (e) {
      setError(e?.message || "Signup failed.");
      console.log("SIGNUP ERROR:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>Create Account</Text>
    {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

      <Text>username</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={username}
        onChangeText={setUsername}
      />

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

      <Text>Type Password again</Text>
      <TextInput
      style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      value={retrypassword}
      onChangeText={setretryPassword}
      />

      <Text>Location</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={location}
        onChangeText={setLocation}
      />
      <Text>Bio</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={bio}
        onChangeText={setBio}
      />

      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
}
