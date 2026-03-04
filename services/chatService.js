import { db } from "../firebase";
import {addDoc,collection,doc,onSnapshot,orderBy,query,serverTimestamp,setDoc,updateDoc,where,} from "firebase/firestore";

// b chat id
export function buildChatId(taskId, a, b) {
  const pair = [a, b].sort().join("_");
  return `${taskId}_${pair}`;
}

// create chat doc if missing
export async function ensureChatExists(ownerUid, volunteerUid, taskId) {
  const chatId = buildChatId(taskId, ownerUid, volunteerUid);
  const ref = doc(db, "chats", chatId);

  await setDoc(
    ref,
    {
      participants: [ownerUid, volunteerUid],
      taskId,
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    },
    { merge: true }
  );

  return chatId;
}

// listen to chat 
export function listenMyChats(uid, cb) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// listen to messages in a chat
export function listenMessages(chatId, cb) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  
  return onSnapshot(q, (snap) => {
    const chats = [];
   snap.forEach((doc) => {chats.push({id: doc.id,...doc.data(),
    });
  });

  cb(chats);
});
}

// send message + update preview
export async function sendMessage(chatId, senderId, text) {
  const clean = String(text ?? "").trim();
  if (!clean) throw new Error("Message is empty.");

  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text: clean,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: clean,
    lastMessageAt: serverTimestamp(),
  });
}