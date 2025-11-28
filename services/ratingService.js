import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";


export async function closeTask(taskId, ownerUid) {
  const taskRef = doc(db, "tasks", taskId);
  const snap = await getDoc(taskRef);

  if (!snap.exists()) throw new Error("Task not found");

  const task = snap.data();

  if (task.ownerUid !== ownerUid) {
    throw new Error("Only the owner can close this task");
  }

  if (task.status !== "accepted") {
    throw new Error("Task must be accepted before closing");
  }

  await updateDoc(taskRef, {
    status: "closed",
    closedAt: Date.now()
  });

  return "Task closed";
}

export async function createRating(taskId, volunteerUid, raterUid, stars) {
  if (stars < 1 || stars > 5) {
    throw new Error("Stars must be between 1 and 5");
  }

 
  const q = query(
    collection(db, "ratings"),
    where("taskId", "==", taskId),
    where("raterUid", "==", raterUid)
  );

  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error("You already rated this user for this task");
  }

  
  const ref = await addDoc(collection(db, "ratings"), {
    taskId,
    volunteerUid,
    raterUid,
    stars,
    createdAt: Date.now()
  });

 
  await updateUserRating(volunteerUid, stars);

  return ref.id;
}


export async function updateUserRating(userId, stars) {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error("User not found");

  const user = snap.data();

  const oldAvg = user.ratingAvg || 0;
  const oldCount = user.ratingCount || 0;

  const newCount = oldCount + 1;
  const newAvg = ((oldAvg * oldCount) + stars) / newCount;

  await updateDoc(userRef, {
    ratingAvg: newAvg,
    ratingCount: newCount
  });

  return "User rating updated";
}
