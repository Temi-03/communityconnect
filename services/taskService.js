import { db } from "../firebase";
import { addDoc, collection,doc,getDoc,getDocs,updateDoc,query,where} from "firebase/firestore";



export async function createTask(ownerUid, data) {
  const task = {
    ...data,
    ownerUid,
    volunteerUid: null,
    status: "open",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const ref = await addDoc(collection(db, "tasks"), task);
  return ref.id;
}

export async function getOpenTasks() {
  const q = query(
    collection(db, "tasks"),
    where("status", "==", "open")
  );
  const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function acceptTask(taskId, volunteerUid) {
  const taskRef = doc(db, "tasks", taskId);
  const snap = await getDoc(taskRef);   

  if (!snap.exists()) {
    throw new Error("Task does not exist");
  }

  const task = snap.data();

  if (task.status !== "open") {
    throw new Error("Task is already accepted or closed");
  }

  await updateDoc(taskRef, {
    status: "accepted",
    volunteerUid,
    updatedAt: Date.now()
  });

  return "Task accepted";
}
