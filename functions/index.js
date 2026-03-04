const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

admin.initializeApp();

 //sh when a chat message is created
exports.onChatMessageCreated = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const snap = event.data;
    const msg = snap?.data();
    const chatId = event.params.chatId;

    try {
      if (!msg?.senderId) throw new Error("Missing senderId");
      if (!msg?.text) throw new Error("Missing text");

      // Get chat doc to find participants
      const chatRef = admin.firestore().doc(`chats/${chatId}`);
      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) throw new Error("Chat not found");

      const chat = chatDoc.data();
      const participants = chat?.participants || [];
      if (!Array.isArray(participants) || participants.length < 2) {
        throw new Error("Chat participants invalid");
      }

      // receiver is the other person
      const receiverUid = participants.find((uid) => uid !== msg.senderId);
      if (!receiverUid) return;

      // Get receiver token
      const userDoc = await admin.firestore().doc(`users/${receiverUid}`).get();
      const expoPushToken = userDoc.data()?.expoPushToken;
      if (!expoPushToken) return;


      const senderDoc = await admin.firestore().doc(`users/${msg.senderId}`).get();
      const senderToken = senderDoc.data()?.expoPushToken;

      if (senderToken && senderToken === expoPushToken) {
        console.log("Skipping push: sender and receiver tokens are the same (same device).");
        return;
      }

      // Build notification
      const title = "New message";
      const body = msg.text.length > 80 ? msg.text.slice(0, 80) + "…" : msg.text;

      const payload = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data: {
          type: "chat",
          chatId,
        },
      };

      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      // Optional: write a log (helps debugging)
      await chatRef.collection("pushLogs").add({
        kind: "messagePush",
        receiverUid,
        senderId: msg.senderId,
        messageId: event.params.messageId,
        expoResponse: result,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.log("onChatMessageCreated error:", err);
    }
  }
);