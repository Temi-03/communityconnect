import { db } from "../firebase";
import { addDoc, collection, doc, getDoc,getDocs, updateDoc, query, where } from "firebase/firestore";
export async function createApplication(taskId, volunteerUid) {
    const q = query(
    collection(db, "applications"),
    where("taskId", "==", taskId),
    where("volunteerUid", "==", volunteerUid)   
  );
  const theresult = await getDocs(q);
  if (!theresult.empty) {
    throw new Error("You have already applied for this task");
  }
    const application = {
    taskId,
    volunteerUid,   
    status: "pending",
    createdAt: Date.now(),}

    const ref = await addDoc(collection(db, "applications"), application);
  return ref.id;

}

export async function acceptApplication(applicationId) {
  const appRef = doc(db, "applications", applicationId);
  const snap = await getDoc(appRef);

  if (!snap.exists()) throw new Error("Application not found");

  const app = snap.data();

  
  await updateDoc(appRef, {
    status: "accepted"
  });

  // Also update the task it belongs to
  const taskRef = doc(db, "tasks", app.taskId);
  await updateDoc(taskRef, {
    status: "accepted",
    volunteerUid: app.volunteerUid,
    updatedAt: Date.now()
  });

  return "Application accepted";
}
