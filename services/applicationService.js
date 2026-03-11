import { db } from "../firebase";
import { buildChatId } from "./chatService";

// generates unqiue id
function appDocId(taskId, volunteerUid) {
  return `${taskId}_${volunteerUid}`;
}

export async function createApplication(taskId, volunteerUid) {
  const taskRef = doc(db, "tasks", taskId); // get the task by id
  const appRef = doc(db, "applications", appDocId(taskId, volunteerUid)); // get appilication by id
  const userRef = doc(db, "users", volunteerUid); // get user by id

  //check is there is a task
  const taskSnap = await getDoc(taskRef);
  if (!taskSnap.exists()) throw new Error("Task does not exist");

  // get the data for that particular task
  const task = taskSnap.data();

  if (task.status !== "open") throw new Error("Task is no longer open.");
  if (task.ownerUid === volunteerUid) {
    throw new Error("You can't apply to your own task.");
  }

  // expiry check
  if (task.dueAt && typeof task.dueAt.toDate === "function") {
    if (task.dueAt.toDate() < new Date()) {
      throw new Error("This task has expired.");
    }
  }

  // get the application data etc...
  const appSnap = await getDoc(appRef);
  if (appSnap.exists()) {
    const s = appSnap.data()?.status;

    if (s === "pending") throw new Error("You already applied (pending).");
    if (s === "accepted") throw new Error("You were already accepted.");
    if (s === "rejected") throw new Error("You were rejected for this task.");

    throw new Error("Application already exists.");
  }

  // getting the user data etc...
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("Volunteer user not found.");

  const u = userSnap.data();

  await setDoc(appRef, {
    taskId,
    taskTitle: task.title ?? "Untitled Task",
    taskLocation: task.location ?? null,
    ownerUid: task.ownerUid,

    volunteerUid,
    volunteerName: u.username ?? "Unknown",
    volunteerRatingAvg: u.ratingAvg ?? 0,
    volunteerRatingCount: u.ratingCount ?? 0,

    status: "pending",
    requestedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    decidedAt: null,
  });

  return "Request sent";
}

export async function getMyApplicationForTask(taskId, volunteerUid) {
  const q = query(
    collection(db, "applications"),
    where("taskId", "==", taskId),
    where("volunteerUid", "==", volunteerUid),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getMyApplications(volunteerUid) {
  const q = query(
    collection(db, "applications"),
    where("volunteerUid", "==", volunteerUid),
  );

  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // newest first
  rows.sort((a, b) => {
    const aTime = a?.createdAt?.seconds ?? 0;
    const bTime = b?.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });

  return rows;
}

export async function getPendingApplicationsForOwner(ownerUid) {
  const q = query(
    collection(db, "applications"),
    where("ownerUid", "==", ownerUid),
  );
  const snap = await getDocs(q);

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a) => a.status === "pending");
}

export async function acceptApplication(appId, ownerUid) {
  const appRef = doc(db, "applications", appId);
  const appSnap = await getDoc(appRef);

  if (!appSnap.exists()) throw new Error("Application not found");

  const app = appSnap.data();

  if (app.ownerUid !== ownerUid) throw new Error("Not allowed.");
  if (app.status !== "pending") throw new Error("Application is not pending.");

  const taskRef = doc(db, "tasks", app.taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) throw new Error("Task not found");

  const task = taskSnap.data();

  if (task.ownerUid !== ownerUid) throw new Error("Not allowed.");
  if (task.status !== "open") throw new Error("Task is no longer open.");

  const chatId = buildChatId(app.taskId, ownerUid, app.volunteerUid);
  const chatRef = doc(db, "chats", chatId);

  await setDoc(
    chatRef,
    {
      participants: [ownerUid, app.volunteerUid],
      taskId: app.taskId,
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    },
    { merge: true },
  );

  await updateDoc(appRef, {
    status: "accepted",
    decidedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(taskRef, {
    status: "accepted",
    acceptedVolunteerUid: app.volunteerUid,
    acceptedVolunteerName: app.volunteerName ?? null,
    acceptedVolunteerRatingAvgAtAccept: app.volunteerRatingAvg ?? 0,
    acceptedVolunteerRatingCountAtAccept: app.volunteerRatingCount ?? 0,
    acceptedAt: serverTimestamp(),
    chatId,
    updatedAt: serverTimestamp(),
  });

  const q = query(
    collection(db, "applications"),
    where("taskId", "==", app.taskId),
    where("status", "==", "pending"),
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    if (d.id !== appId) {
      await updateDoc(d.ref, {
        status: "rejected",
        decidedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rejectReason: "Task assigned to another volunteer",
      });
    }
  }

  return "accepted and chat created";
}

export async function rejectApplication(appId, ownerUid) {
  const appRef = doc(db, "applications", appId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(appRef);
    if (!snap.exists()) throw new Error("Application not found");

    const app = snap.data();
    if (app.ownerUid !== ownerUid) throw new Error("Not allowed.");
    if (app.status !== "pending")
      throw new Error("Application is not pending.");

    tx.update(appRef, {
      status: "rejected",
      decidedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return "Rejected";
}

export async function withdrawApplication(appId, currentUid) {
  if (!currentUid) throw new Error("Not logged in.");

  const ref = doc(db, "applications", appId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Application not found.");

  const app = snap.data();

  if (app.volunteerUid !== currentUid) throw new Error("Not allowed.");
  if (app.status !== "pending")
    throw new Error("You can only withdraw pending applications.");

  await deleteDoc(ref);
  return true;
}
