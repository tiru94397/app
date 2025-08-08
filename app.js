// Enhanced app.js for polished WhatsApp clone frontend
const socket = io();

// DOM Elements
const senderInput = document.getElementById("sender");
const receiverInput = document.getElementById("receiver");
const joinBtn = document.getElementById("joinBtn");
const messagesDiv = document.getElementById("messages");
const contentInput = document.getElementById("content");
const sendBtn = document.getElementById("sendBtn");
const chatTitle = document.getElementById("chatTitle");
const typingStatus = document.getElementById("typingStatus");

let currentSender = "";
let currentReceiver = "";

const escapeHtml = (s) =>
  s?.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const appendMessage = (msg) => {
  const row = document.createElement("div");
  row.className = "message-row";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble " + (msg.sender === currentSender ? "me" : "them");
  const time = new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  bubble.innerHTML = `${escapeHtml(msg.content)}<div class="message-meta">${msg.sender} • ${time}</div>`;

  row.appendChild(bubble);
  messagesDiv.appendChild(row);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// Socket Events
socket.on("connect", () => console.log("Socket connected", socket.id));
socket.on("new_message", appendMessage);
socket.on("user_typing", ({ sender }) => {
  typingStatus.textContent = `${sender} is typing...`;
  setTimeout(() => (typingStatus.textContent = ""), 1500);
});

// UI Actions
joinBtn.addEventListener("click", async () => {
  const s = senderInput.value.trim();
  const r = receiverInput.value.trim();
  if (!s || !r) return alert("Enter both names");
  currentSender = s;
  currentReceiver = r;
  chatTitle.textContent = `${s} ↔ ${r}`;
  socket.emit("join", s);

  try {
    const res = await fetch(`/api/messages/${encodeURIComponent(s)}/${encodeURIComponent(r)}`);
    const data = await res.json();
    messagesDiv.innerHTML = "";
    if (data.success) data.messages.forEach(appendMessage);
    else console.warn("History error:", data);
  } catch (err) {
    console.error("History load failed", err);
  }
});

sendBtn.addEventListener("click", sendMessage);
contentInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
  else if (currentSender && currentReceiver) {
    socket.emit("typing", { sender: currentSender, receiver: currentReceiver });
  }
});

async function sendMessage() {
  const text = contentInput.value.trim();
  if (!text || !currentSender || !currentReceiver) return;

  const payload = { sender: currentSender, receiver: currentReceiver, content: text };
  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) contentInput.value = "";
    else alert("Send failed: " + (data.error || "unknown"));
  } catch (err) {
    console.error("Send error:", err);
  }
}
