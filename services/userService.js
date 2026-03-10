import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp,deleteField } from "firebase/firestore";

export async function createUser(uid, data) { //used to create the user
  const email = String(data.email).trim();  //removing white space form data
  const username = String(data.username).trim();
  const location = String(data.location).trim();
  const ref = doc(db, "users", uid);
  await setDoc(ref, { // where the data is passed in 
    uid,
    username,
    email,
    location,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  
  });
}

export async function getUser(uid) { //get user id
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.data();
}

export async function updateUser(uid, data) { // will be used to update user dtat
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return true;
}

// delete user info
export async function deleteUser(uid) {
  if (!uid) throw new Error("Missing uid.");
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    username: "Deleted user",
    location: "",
    email: deleteField(),
    expoPushToken: deleteField(),
    photoURL: deleteField(),
    updatedAt: serverTimestamp(),
  });

  return true;
}
