import { db } from "../firebase";
import {addDoc,collection,query,orderBy,getDocs,serverTimestamp,where,doc,deleteDoc} from "firebase/firestore";

export async function createNotice({ userId, username, info,location }) {
  const cleanInfo = String(info).trim();
  const cleanUsername = String(username);
  const cleanLocation = String(location);
 
  if (!cleanInfo) throw new Error("Notice text is required.");

  const post = {
    userId,
    username: cleanUsername,
    location:cleanLocation,
    information: cleanInfo,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "noticeBoard"), post);
  return ref.id;
}

export async function getNotices(currentTown) {
  const q = query(collection(db, "noticeBoard"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const results =[];
  snap.docs.forEach((d) => { //loop through to find where the task is not theirs and it is in the specified town also not expired
    const t = { id: d.id, ...d.data() };
    if (currentTown && t.location !== currentTown) return;
    results.push(t);
  });
  return results;
}

export async function getMyNotices(userId) {
  const q = query(
    collection(db, "noticeBoard"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const results = [];
  snap.forEach((d) => {
    results.push({ id: d.id, ...d.data() });
  });
  return results;
}

export async function deleteNotice(noticeId) {
  const ref = doc(db, "noticeBoard", noticeId);
  await deleteDoc(ref);
}