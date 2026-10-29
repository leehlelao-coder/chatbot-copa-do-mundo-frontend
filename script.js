// Depois do deploy do backend no Render, cole aqui a URL pública da API.
// Exemplo: https://seu-chatbot-api.onrender.com
const API_URL = "http://127.0.0.1:5000";

const form = document.querySelector("#chat-form");
const input = document.querySelector("#user-input");
const messages = document.querySelector("#messages");
const sendButton = document.querySelector("#send-button");
const clearButton = document.querySelector("#clear-chat");
const history = [];

function addMessage(role, content) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (role === "bot") {
    const label = document.createElement("span");
    label.className = "bubble-label";
    label.textContent = "CENTRAL DO FUTEBOL";
    bubble.appendChild(label);
  }
  // textContent evita interpretar a resposta como HTML executável.
  const text = document.createElement("span");
  text.textContent = content;
  bubble.appendChild(text);

  const time = document.createElement("time");
  time.textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  wrapper.append(bubble, time);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  return wrapper;
}

function showTyping() {
  const wrapper = document.createElement("div");
  wrapper.className = "message bot";
  wrapper.id = "typing-indicator";
  const dots = document.createElement("div");
  dots.className = "typing";
  for (let i = 0; i < 3; i++) dots.appendChild(document.createElement("span"));
  wrapper.appendChild(dots);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(message) {
  addMessage("user", message);
  const previousHistory = history.slice(-8);
  history.push({ role: "user", content: message });
  sendButton.disabled = true;
  input.disabled = true;
  showTyping();

  try {
    if (!API_URL.startsWith("https://") && !API_URL.startsWith("http://")) {
      throw new Error("Configure a URL do backend do Render no arquivo frontend/script.js antes de testar.");
    }
    const response = await fetch(`${API_URL.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: previousHistory })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "O servidor não conseguiu responder.");
    const reply = data.reply || "Não recebi uma resposta. Tente novamente.";
    history.push({ role: "assistant", content: reply });
    addMessage("bot", reply);
  } catch (error) {
    addMessage("bot", `Ops! ${error.message || "Não consegui conectar ao servidor."}`);
  } finally {
    document.querySelector("#typing-indicator")?.remove();
    sendButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || sendButton.disabled) return;
  input.value = "";
  sendMessage(message);
});

document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!sendButton.disabled) sendMessage(button.dataset.question);
  });
});

clearButton.addEventListener("click", () => {
  history.length = 0;
  messages.replaceChildren();
  const wrapper = document.createElement("div");
  wrapper.className = "message bot";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = "Conversa reiniciada! ⚽ Qual é sua pergunta sobre a Copa do Mundo?";
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
});
