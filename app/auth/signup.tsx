import { useState } from "react";//
import {View,Text,TextInput,Pressable,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,} from "react-native";
import { createUserWithEmailAndPassword,sendEmailVerification } from "firebase/auth";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"; //to help user search for town
import { auth } from "../../firebase";
import { createUser } from "../../services/userService";
import { router } from "expo-router";
import { registerForPushNotifications } from "../../services/notificationService";
import { savePushToken } from "../../services/userService";

export default function Signup() {
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retrypassword, setretryPassword] = useState("");
  const [town, setTown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  async function handleSignup() {// the main function that handles the signup process
    try {
      setError("");
      setLoading(true);

      const name = username.trim();// remove extra spaces
      const mail = email.trim();


      if (!name) throw new Error("Username is required.");
      if (!mail) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");
      if (password.length < 6)throw new Error("Password must be at least 6 characters.");
      if (retrypassword !== password) throw new Error("Passwords do not match.");
      if (!town) throw new Error("Please select a town.");
      const userCred = await createUserWithEmailAndPassword(auth,mail,password);
      
      await createUser(userCred.user.uid, { // create user document in Firestore
        username: name, 
        email: mail,
        location: town,
      });
      await sendEmailVerification(userCred.user);
      try {
    const token = await registerForPushNotifications();
    if (token) await savePushToken(userCred.user.uid, token);
    } catch (err: any) {
    console.log("Push token not saved after signup:", err?.message || err);
    }

      router.replace("/auth/verifyEmail"); // navigate to check for email verification
    } catch (err: any) {
      setError(err.message || "Signup failed.");
      console.log("SIGNUP ERROR:", err);
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
        <View style={styles.textContainer}>
          <Text style={styles.title}>Create</Text>
          <Text style={styles.title}>Account</Text>
        </View>
      <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TextInput placeholder="Username"
            placeholderTextColor="#e09020b7"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#e09020b7"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#e09020b7"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#e09020b7"
            style={styles.input}
            value={retrypassword}
            onChangeText={setretryPassword}
            secureTextEntry
          />

          <GooglePlacesAutocomplete
            placeholder="Town"
            fetchDetails={false}
            onPress={(data) => {
              const townName = data.description.split(",")[0].trim();
              setTown(townName);
            }}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
              language: "en",
              components: "country:ie",
            }}
            styles={{
              textInput: styles.input,
              container: { width: "100%" },
              listView: {
                borderRadius: 12,
                marginTop: -8,
                overflow: "hidden",
               
              },
               placeholder: { color: "#e09020b7", },
            }}
          />

          <Pressable
            style={[styles.signUpButton, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signUpText}>
              {loading ? "Signing up..." : "Sign Up"}
            </Text>
          </Pressable>

          <Text style={styles.questionText}>Already have an account?</Text>

          <Pressable
            style={styles.loginButton}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e09020b7",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  textContainer: {
    marginBottom: 35,
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
    marginBottom: 12,
    color: "#e09020b7",
  },

  signUpButton: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  signUpText: {
    color: "#e09020b7",
    fontSize: 16,
    fontWeight: "600",
  },

  questionText: {
    color: "white",
    marginBottom: 12,
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
