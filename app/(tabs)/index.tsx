import { View, Text, Button } from "react-native";
import { auth,db } from "../../firebase";
import { router } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { createUser, getUser, updateUser } from "../../services/userService"; //imports CRUD functions forour databases 
import { createTask,getOpenTasks, acceptTask} from "../../services/taskService"; //
import { createApplication,acceptApplication } from "../../services/applicationService";
import { closeTask, createRating } from "../../services/ratingService";
import { createNotice, getNotices } from "../../services/noticeService";

export default function HomeTab() {

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

  async function testLogin() {
    try {
      const email = "test@example.com";
      const password = "password123";

      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("LOGGED IN:", userCred.user.uid);

      const profile = await getUser(userCred.user.uid);
      console.log("USER PROFILE:", profile);
    } catch (e) {
      console.log("LOGIN ERROR:", e);
    }
  }

  async function testCreateTask() {
  const owner = auth.currentUser?.uid;

  if (!owner) return console.log("No logged-in user");

  const id = await createTask(owner, {
    title: "Carry boxes",
    details: "Need help at 5pm",
    category: "Errands",
    dueAt: "2025-11-20"
  });

  console.log("TASK CREATED WITH ID:", id);
}

async function testGetOpenTasks() {
  const tasks = await getOpenTasks();
  console.log("OPEN TASKS:", tasks);
}
async function testAcceptTask(){
  try {
    
    const volunteerUid = auth.currentUser?.uid;
    if (!volunteerUid) return console.log("No logged in user");

    const tasks = await getOpenTasks();
    if (tasks.length === 0) {
      return console.log("No open tasks to accept");
    }

    const taskId = tasks[0].id;

    const result = await acceptTask(taskId, volunteerUid);

    console.log("ACCEPT RESULT:", result);

  } catch (err) {
    console.log("ACCEPT ERROR:", err);
  }

  
}
async function testApply() {
  try {
    const volunteerUid = auth.currentUser?.uid;
    if (!volunteerUid) return console.log("No logged in user");

    const tasks = await getOpenTasks();
    if (tasks.length === 0)
      return console.log("No open tasks to apply to");

    const taskId = tasks[0].id;

    const appId = await createApplication(taskId, volunteerUid);
    console.log("APPLICATION CREATED:", appId);

  } catch (e) {
    console.log("APPLY ERROR:", e);
  }
}

async function testAccept() {
  try {
    const volunteerUid = auth.currentUser?.uid;
    if (!volunteerUid) return console.log("No logged in user");

    
    const q = query(
      collection(db, "applications"),
      where("volunteerUid", "==", volunteerUid)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty)
      return console.log("No applications found");

    const appId = snapshot.docs[0].id;

    const res = await acceptApplication(appId);
    console.log("APPLICATION ACCEPTED:", res);

  } catch (e) {
    console.log("ACCEPT ERROR:", e);
  }

 

}

 async function testCloseTask() {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return console.log("No logged in user");

    const tasks = await getOpenTasks();
    if (tasks.length === 0) return console.log("No tasks to close");

    const taskId = tasks[0].id;

    const res = await closeTask(taskId, uid);
    console.log(res);

  } catch (e) {
    console.log("CLOSE ERROR:", e);
  }
  
}

async function testRating() {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return console.log("No logged in user");

    
    const q = query(
      collection(db, "tasks"),
      where("status", "==", "closed"),
      where("ownerUid", "==", uid)
    );

    const snaps = await getDocs(q);
    if (snaps.empty) return console.log("No closed tasks to rate");

    const task = snaps.docs[0].data();
    const taskId = snaps.docs[0].id;

    const res = await createRating(taskId, task.volunteerUid, uid, 5);
    console.log("RATING CREATED:", res);

  } catch (e) {
    console.log("RATING ERROR:", e);
  }
}

async function testCreateNotice() {
  const uid = auth.currentUser?.uid;
  if (!uid) return console.log("No logged in user");

  const id = await createNotice(uid, "Community BBQ tomorrow!", null);
  console.log("NOTICE CREATED:", id);
}

async function testGetNotices() {
  const posts = await getNotices();
  console.log("NOTICE POSTS:", posts);
}
  return (
    <View style={{
      flex: 1,
      backgroundColor: "purple",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 40, color: "white" }}>TEST </Text>
      <Button title="Accept First Open Task" onPress={testAcceptTask} />
      <Button title="Read User" onPress={testReadUser} />
      <Button title="Update User" onPress={testUpdateUser} />
      <Button title="Test Login" onPress={testLogin} />
    <Button title="Create Task" onPress={testCreateTask}/>
    <Button title="Get Open Tasks" onPress={testGetOpenTasks} />
    <Button title="Apply to Task" onPress={testApply} />
<Button title="Accept Application" onPress={ testAccept} />
      <Button title="Go to Signup" onPress={() => router.push("/auth/signup")} />
      <Button title="Go to Login" onPress={() => router.push("/auth/login")} />
    <Button title="Close Task" onPress={testCloseTask} />
<Button title="Rate Volunteer" onPress={testRating} />
<Button title="Create Notice" onPress={testCreateNotice} />
<Button title="Get Notices" onPress={testGetNotices} />

    </View>
  );
}
