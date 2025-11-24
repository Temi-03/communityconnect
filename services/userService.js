import { doc, setDoc, getDoc /* reads*/, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; //db is the firestore sonnection from firebase 

export async function createUser(uid, data) {
  return await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUser(uid, data) {
  return await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: Date.now()
  });
}
