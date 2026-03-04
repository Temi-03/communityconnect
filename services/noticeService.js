import { db } from "../firebase";
import {addDoc,collection,query,orderBy,getDocs,serverTimestamp,} from "firebase/firestore";

export async function createNotice({ userId, username, info }) {
  const cleanInfo = String(info ?? "").trim();
  const cleanUsername = String(username ?? "").trim();

 
  if (!cleanInfo) throw new Error("Notice text is required.");

  const post = {
    userId,
    username: cleanUsername,
    information: cleanInfo,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "noticeBoard"), post);
  return ref.id;
}

export async function getNotices() {
  const q = query(collection(db, "noticeBoard"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}