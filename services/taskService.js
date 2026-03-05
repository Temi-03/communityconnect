import { auth,db } from "../firebase";
import {addDoc,collection,doc,getDocs,getDoc,query,updateDoc,serverTimestamp,Timestamp, where,limit} from "firebase/firestore";
import { getUser } from "./userService";

export async function createTask(ownerUid, data) {
  const title = String(data.title).trim();  //removing white space form data
  const details = String(data.details).trim();
  const location = String(data.location).trim();

  const task = { //object saved in firestore
    title,
    details,
    location,
    dueAt:Timestamp.fromDate(new Date(data.dueAt)),
    ownerUid,
    status: "open",               // stays open until approval
    acceptedVolunteerUid: null,   // filled when approved
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

   await addDoc(collection(db, "tasks"), task); // add doc to the task colletion
}

export async function getOpenTasks(currentUid) {
  const user = await getUser(currentUid);
  const currentTown = user.location;
  const q = query(collection(db, "tasks"), where("status", "==", "open"));
  const snap = await getDocs(q); //stores all the relevent matching task
  const now = new Date(); //use current date to check expiry
  const results = []; //where the valid documents are stored

  snap.docs.forEach((d) => { //loop through to find where the task is not theirs and it is in the specified town also not expired
    const t = { id: d.id, ...d.data() };
    if (t.ownerUid === currentUid) return;
    if (currentTown && t.location !== currentTown) return;
    const isExpired = t.dueAt.toDate() < now; //checking if it is expired
    if (!isExpired) results.push(t); //add it to the array
  });
  return results;
}

export async function getTaskById(taskId) {
  const ref = doc(db, "tasks", taskId); // gets the document with that id
  const snap = await getDoc(ref); 
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() }; // returns the data
}

export async function getMyPostedTasks(ownerUid) {
  const q = query(collection(db, "tasks"), where("ownerUid", "==", ownerUid));
  const snap = await getDocs(q);
  const rows = [];
  snap.docs.forEach((d) => { const t = {id: d.id, ...d.data() } ;
  if (t.status === "deleted") return;
  rows.push(t);});
  rows.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds); //sorting the newer from the old
  return rows;
}

export async function getTasksForUser(uid) {
  // tasks where user is owner OR accepted volunteer
  const ownerQ = query(collection(db, "tasks"), where("ownerUid", "==", uid));
  const volQ = query(collection(db, "tasks"), where("acceptedVolunteerUid", "==", uid));
  const ownerSnap = await getDocs(ownerQ);
  const  volSnap = await getDocs(volQ);
  const rows = [];;
  ownerSnap.docs.forEach((d) => {rows.push({ id: d.id, ...d.data() });});
  volSnap.docs.forEach((d) => {rows.push({ id: d.id, ...d.data() });});
  rows.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  
  return rows;
}

export async function markTaskCompleted(taskId, ownerUid) {
  const taskRef = doc(db, "tasks", taskId);
  const snap = await getDoc(taskRef);
  if (!snap.exists()) throw new Error("Task not found.");
  const task = snap.data();
  
  if (task.ownerUid !== ownerUid) throw new Error("Not allowed.");
  if (task.status !== "accepted") {
      throw new Error("Only accepted tasks can be marked completed.");
    }

    await updateDoc(taskRef, {
      status: "completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  return "Completed";
}
export async function deleteTask(taskId) {
  const uid = auth.currentUser?.uid;
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (!taskSnap.exists()) throw new Error("Task not found.");
  const task = taskSnap.data();
  if (task.ownerUid !== uid) throw new Error("Not allowed.");
  const status = task.status;
  if (status === "completed") {
    throw new Error("Completed tasks cannot be deleted.");
  }
  if (status === "accepted") {
    throw new Error("Accepted tasks cannot be deleted. Cancel the task instead.");
  }
  const appsQ = query(
    collection(db, "applications"),
    where("taskId", "==", taskId),
    limit(1)
  );
  const appsSnap = await getDocs(appsQ);
  const hasApps = !appsSnap.empty;

  if (!hasApps) {
    await updateDoc(taskRef, {
      status: "deleted",
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { action: "deleted" };
  } else {
    await updateDoc(taskRef, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { action: "cancelled" };
  }
}