import { useEffect, useState } from "react";
import {View,Text,ScrollView,TextInput,Pressable,ActivityIndicator,StyleSheet,} from "react-native";
import { router, Stack } from "expo-router";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {clearPushToken,deleteUser as deleteUserDoc,} from "../../services/userService";
import { signOut, updatePassword, deleteUser } from "firebase/auth";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
export default function SettingsScreen() {
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [town, setTown] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  }

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data: any = snap.data();
          setUsername(data.username ?? "");
          setTown(data.town ?? "");
        }
      } catch (e: any) {
        showMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  async function saveProfile() {
    if (!uid) return;

    if (!username.trim()) {
      showMessage("Username required.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", uid), {
        username: username.trim(),
        town: town.trim(),
      });

      showMessage("Profile updated.");
    } catch {
      showMessage("Save failed.");
    }
  }

  async function changePassword() {
    const user = auth.currentUser;
    if (!user) return;

    if (!newPassword || newPassword.length < 6) {
      showMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    try {
      await updatePassword(user, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      showMessage("Password changed.");
    } catch {
      showMessage("Password change failed.");
    }
  }

  async function handleLogout() {
    const uidNow = auth.currentUser?.uid;

    try {
      if (uidNow) await clearPushToken(uidNow);
    } catch {}

    await signOut(auth);
    router.replace("/auth/login");
  }

  async function handleDeleteAccount() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const uidNow = user.uid;

      await clearPushToken(uidNow);
      await deleteUserDoc(uidNow);
      await deleteUser(user);

      router.replace("/auth/login");
    } catch {
      showMessage("Delete failed.");
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Stack.Screen options={{ title: "Settings" }} />
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "Settings", headerTitleAlign: "center" }} />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.title}>Profile</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        style={styles.input}
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

      <Pressable onPress={saveProfile} style={styles.button}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>

      <Text style={styles.title}>Password</Text>

      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Retype new password"
        secureTextEntry
        style={styles.input}
      />

      <Pressable onPress={changePassword} style={styles.button}>
        <Text style={styles.buttonText}>Change password</Text>
      </Pressable>

      <Text style={styles.title}>Account</Text>

      <Pressable onPress={handleLogout} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Logout</Text>
      </Pressable>

      <Pressable onPress={handleDeleteAccount} style={styles.dangerButton}>
        <Text style={styles.dangerText}>Delete account</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },

  content: {
    paddingBottom: 24,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  message: {
    marginBottom: 12,
    color: "#b00020",
    fontWeight: "600",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#111",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "white",
  },

  button: {
    backgroundColor: "#3d8d34",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  secondaryText: {
    color: "#111",
    fontWeight: "700",
  },

  dangerButton: {
    backgroundColor: "#ffe5e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3b3b3",
  },

  dangerText: {
    color: "#b00020",
    fontWeight: "700",
  },
});