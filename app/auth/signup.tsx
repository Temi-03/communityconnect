import { useState } from "react";//
import {View,Text,TextInput,Pressable,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,} from "react-native";
import { createUserWithEmailAndPassword,sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase";
import { createUser } from "../../services/userService";
import { router } from "expo-router";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retrypassword, setretryPassword] = useState("");
  const [town, setTown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTowns, setShowTowns] = useState(false);

  const locations = [
    "Select your area",
    "Balbriggan",
    "Baldoyle",
    "Ballyboden",
    "Blackrock",
    "Blanchardstown",
    "Castleknock",
    "Clonee",
    "Clondalkin",
    "Clonsilla",
    "Dalkey",
    "Donabate",
    "Dún Laoghaire",
    "Glasthule",
    "Howth",
    "Killiney",
    "Knocklyon",
    "Lucan",
    "Lusk",
    "Malahide",
    "Maynooth",
    "Mulhuddart",
    "Newcastle",
    "Portmarnock",
    "Rathfarnham",
    "Rush",
    "Saggart",
    "Sandycove",
    "Santry",
    "Shankill",
    "Skerries",
    "Swords",
    "Sutton",
    "Tallaght",
  ];

  async function handleSignup() {
    // the main function that handles the signup process
    try {
      setError("");
      setLoading(true);

      const name = username; // remove extra spaces
      const mail = email;

      if (!name) throw new Error("Username is required.");
      if (!mail) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");
      if (password.length < 6)
        throw new Error("Password must be at least 6 characters.");
      if (retrypassword !== password)
        throw new Error("Passwords do not match.");
      if (!town) throw new Error("Please select a town.");
      const userCred = await createUserWithEmailAndPassword(
        auth,
        mail,
        password,
      );

      await createUser(userCred.user.uid, {
        // create user document in Firestore
        username: name,
        email: mail,
        location: town,
      });
      await sendEmailVerification(userCred.user);

      router.replace("/auth/verifyEmail"); // navigate to check for email verification
    } catch (err: any) {
      if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else if (err?.code === "auth/email-already-in-use") {
        setError("Email already used.");
      } else setError(err.message || "Signup failed.");
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>Create</Text>
          <Text style={styles.title}>Account</Text>
        </View>
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TextInput
            placeholder="Username"
            placeholderTextColor="#000000"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#000000"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#000000"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#080808"
            style={styles.input}
            value={retrypassword}
            onChangeText={setretryPassword}
            secureTextEntry
          />

          <View style={styles.dropdownContainer}>
            <Pressable
              onPress={() => setShowTowns(!showTowns)}
              style={styles.input}
            >
              <Text style={{ color: town ? "#111" : "#777" }}>
                {town || "Select your area"}
              </Text>
            </Pressable>

            {showTowns && (
              <View style={styles.dropdownList}>
                <ScrollView nestedScrollEnabled>
                  {locations.map((loc) => (
                    <Pressable
                      key={loc}
                      onPress={() => {
                        setTown(loc);
                        setShowTowns(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text>{loc}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
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
    backgroundColor: "#e8ab55",
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
    color: "#000000",
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
    color: "#e8ab55",
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
  dropdownContainer: {
    width: "100%",
    marginBottom: 12,
  },

  dropdownList: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "white",
    maxHeight: 220,
    overflow: "hidden",
    marginTop: -8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
