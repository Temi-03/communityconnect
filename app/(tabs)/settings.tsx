import { useEffect, useState,useRef} from "react";
import {View,Text,ScrollView,TextInput,Pressable,ActivityIndicator,StyleSheet,} from "react-native";
import { router, Stack } from "expo-router";
import { auth, db } from "../../firebase";
import { doc,onSnapshot } from "firebase/firestore";
import {clearPushToken,deleteUser as deleteUserDoc,updateUser} from "../../services/userService";
import { signOut, updatePassword, deleteUser,EmailAuthProvider,reauthenticateWithCredential, } from "firebase/auth";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { FontAwesome } from "@expo/vector-icons";
export default function SettingsScreen() {
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [town, setTown] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [ratingAvg, setRatingAvg] = useState(0);
  const placesRef = useRef<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  }

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
  const unsub = onSnapshot(
    doc(db, "users", uid),
    (snap) => {
        if (snap.exists()) {
          const data: any = snap.data();

        const loc = String(data.location);

        setUsername(String(data.username));
        setTown(loc);
        setRatingAvg(Number(data.ratingAvg ?? 0));
        setTimeout(() => {
          if (placesRef.current) {
            placesRef.current.setAddressText(loc);
          }
        }, 300);
      }

      setLoading(false);
    },
    (err) => {
      showMessage("Failed to load profile.");
       setLoading(false);
    }
  );

  return () => unsub();
}, [uid]);

  async function saveProfile() {
    if (!uid) return;

    if (!username.trim()) {showMessage("Username required.");
      return;
    }

    try {
      await updateUser(uid, {
        username: username.trim(),
        location: town.trim(),
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
      const user = await reauthenticateUser();
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("Password changed.");
    }  catch (e: any) {
    console.log("Password change failed:", e);

    if (
      e.code === "auth/wrong-password" ||
      e.code === "auth/invalid-credential"
    ) {
      showMessage("Current password is incorrect.");
    } else if (e?.code === "auth/weak-password") {
      showMessage("Choose a stronger password.");
    } else {
      showMessage(e?.message || "Password change failed.");
    }
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
      const user = await reauthenticateUser();
      const uidNow = user.uid;

      await clearPushToken(uidNow);
      await deleteUserDoc(uidNow);
      await deleteUser(user);
      await signOut(auth);
      showMessage("Account deleted.");
       router.replace("/entry");
    } catch (e: any) {
    console.log("Delete account failed:", e);
    if (
      e?.code === "auth/wrong-password" ||
      e?.code === "auth/invalid-credential"
    ) {
      showMessage("Current password is incorrect.");
    } else if (e?.code === "auth/requires-recent-login") {
      showMessage("Please log in again and try.");
    } else {
      showMessage(e?.message || "Delete failed.");
    }
  }
  
}
async function reauthenticateUser() {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No logged in user found.");
  }
  if (!currentPassword.trim()) {
    throw new Error("Enter your current password.");
  }
  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );
  await reauthenticateWithCredential(user, credential);
  return user;
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: "Settings", headerTitleAlign: "center" }} />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.title}>Profile</Text>
      <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>Rating</Text>
        {ratingAvg > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
           <FontAwesome name="star" size={16} color="#f5b301" />
      <Text style={styles.ratingValue}>{ratingAvg.toFixed(1)}</Text>
    </View>
    ) : (
    <Text style={styles.ratingEmpty}>No ratings yet</Text>
  )}
</View>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        style={styles.input}
      />
      <GooglePlacesAutocomplete
            ref={placesRef}
            placeholder="Town"
            fetchDetails={false}
            onPress={(data) => {
              const townName =  data.structured_formatting.main_text ||data.description.split(",")[0].trim();
              setTown(townName);
              placesRef.current?.setAddressText(townName);
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
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          secureTextEntry
          style={styles.input}
        />

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
  ratingRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  marginBottom: 12,
  backgroundColor: "white",
},

ratingLabel: {
  fontWeight: "700",
  color: "#111",
},

ratingValue: {
  fontWeight: "700",
  color: "#111",
},

ratingEmpty: {
  fontWeight: "600",
  color: "#777",
},
});