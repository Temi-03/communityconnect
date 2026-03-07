import {addDoc,collection,doc,getDocs,limit,query,updateDoc,serverTimestamp,where,getDoc} from "firebase/firestore";
import { db } from "../firebase";

function maxMinStars(stars) {
  if (stars < 1 || stars > 5) throw new Error("Stars must be between 1 and 5");
}

export async function getMyRatingForTask(taskId, raterUid) {
  const q = query(
    collection(db, "ratings"),
    where("taskId", "==", taskId),
    where("raterUid", "==", raterUid),
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function updateUserRating(userId, stars) {
  maxMinStars(stars);
  const userRef = doc(db, "users", userId);

    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");

    const user = snap.data();
    const oldCount = Number(user.ratingCount || 0);
    const oldAvg = Number(user.ratingAvg || 0);

    const newCount = oldCount + 1;
    const newAvg = ((oldAvg * oldCount) + stars) / newCount;

    await updateDoc(userRef, {
      ratingCount: newCount,
      ratingAvg: newAvg,
    });
  

  return "User rating updated";
}

export async function createStarRatingForTask(taskId, raterUid, stars) {
  maxMinStars(stars);

  const existing = await getMyRatingForTask(taskId, raterUid);
  if (existing) throw new Error("You already rated this task.");

  const q = query(
    collection(db, "applications"),
    where("taskId", "==", taskId),
    where("status", "==", "accepted"),
    limit(1)
  );

  const appsSnap = await getDocs(q);

  if (appsSnap.empty) throw new Error("No volunteer to rate for this task.");
  const app = appsSnap.docs[0].data();
  const volunteer = app.volunteerUid;
  const requestor = app.ownerUid

  const ratedUserUid = raterUid === requestor ? volunteer : requestor;
  const ref = await addDoc(collection(db, "ratings"), {
    taskId,
    ratedUserUid,
    raterUid,
    stars,
    createdAt: serverTimestamp(),
  });

  await updateUserRating(ratedUserUid, stars);

  return ref.id;
}