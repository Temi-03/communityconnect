import { View, Text, Button } from "react-native";
import { createUser, getUser, updateUser } from "../../services/userService";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function HomeTab() {

  async function testCreateUser() {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        "test@example.com",
        "password123"
      );

      await createUser(userCred.user.uid, {
        name: "Test User",
        email: "test@example.com",
        ratingAvg: 0,
        ratingCount: 0,
        skills: [],
      });

      console.log("USER CREATED:", userCred.user.uid);

    } catch (e) {
      console.log("ERROR CREATING USER:", e);
    }
  }

  async function testReadUser() {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return console.log("No logged in user");

      const data = await getUser(uid);
      console.log("USER DATA:", data);

    } catch (e) {
      console.log("ERROR READING USER:", e);
    }
  }

  async function testUpdateUser() {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return console.log("No logged in user");

      await updateUser(uid, { bio: "updated bio" });

      console.log("USER UPDATED");

    } catch (e) {
      console.log("UPDATE ERROR:", e);
    }
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: "purple",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 40, color: "white" }}>TEST </Text>
      <Button title="Create User" onPress={testCreateUser} />
      <Button title="Read User" onPress={testReadUser} />
      <Button title="Update User" onPress={testUpdateUser} />
    </View>
  );
}
