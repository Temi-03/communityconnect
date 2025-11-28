import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { createUser } from "../../services/userService";
import { router } from "expo-router";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
     
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
        
      );

      
      await createUser(userCred.user.uid, {
        name,
        email,
        ratingAvg: 0,
        ratingCount: 0,
        skills: [],

      });

      console.log("Signup successful!");

     
      router.replace("/");

    } catch (error) {
      console.log("SIGNUP ERROR:", error);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>Create Account</Text>

      <Text>Name</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={name}
        onChangeText={setName}
      />

      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={email}
        onChangeText={setEmail}
      />

      <Text>Password</Text>
      <TextInput
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
}
