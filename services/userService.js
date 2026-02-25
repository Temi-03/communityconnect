import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp,deleteDoc } from "firebase/firestore";

export async function createUser(uid, data) { //used to create the user
  const ref = doc(db, "users", uid);

  await setDoc(ref, { // where the data is passed in 
    uid,
    ratingAvg: 0,
    ratingCount: 0,
    
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  });

  return uid;
}

export async function getUser(uid) { //get user id
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
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
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
  return true;
}

export async function savePushToken(uid, expoPushToken) { // save the push token to the user document, so that we can send push notifications to the user later
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      expoPushToken,
      tokenUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}