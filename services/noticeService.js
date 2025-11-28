import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

export async function createNotice(userId, info, photo = null) {
  const post = {
    userId,
    information: info,
    photo,
    createdAt: Date.now(),
  };

  const ref = await addDoc(collection(db, "noticeBoard"), post);
  return ref.id;
}

export async function getNotices() {
  const q = query(
    collection(db, "noticeBoard"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}