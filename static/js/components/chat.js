import { sendChat } from "../api.js";

export function setupChat(sessionId) {
  const form     = document.getElementById("chatForm");
  const input    = document.getElementById("chatInput");
  const msgList  = document.getElementById("chatMessages");
  const sendBtn  = document.getElementById("chatSend");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    setLoading(sendBtn, true);
    appendMessage(msgList, "user", text);

    try {
      const data = await sendChat(sessionId, text);
      appendMessage(msgList, "assistant", data.response);
    } catch (err) {
      appendMessage(msgList, "error", err.message);
    } finally {
      setLoading(sendBtn, false);
      input.focus();
    }
  });
}

function appendMessage(container, role, text) {
  const div = document.createElement("div");
  div.className = `chat-msg chat-msg-${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? "..." : "전송";
}
