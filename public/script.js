const socket = io();

const joinModal = document.getElementById('joinModal');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const messagesDiv = document.getElementById('messages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');

let username = '';

joinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    socket.emit('join', username);
    joinModal.style.display = 'none';
    chatContainer.style.display = '';
    messageInput.focus();
  }
};

usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

socket.on('history', (messages) => {
  messagesDiv.innerHTML = '';
  messages.forEach(msg => addMessage(msg, msg.user === username));
});

socket.on('chat-message', (msg) => {
  addMessage(msg, msg.user === username);
});

socket.on('user-joined', (name) => {
  addSystemMessage(`${name} joined the chat`);
});

socket.on('user-left', (name) => {
  addSystemMessage(`${name} left the chat`);
});

chatForm.onsubmit = (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit('chat-message', msg);
    messageInput.value = '';
  }
};

function addMessage({ user, text }, isOwn) {
  const div = document.createElement('div');
  div.className = 'msg ' + (isOwn ? 'sent' : 'received');
  if (!isOwn) {
    const userSpan = document.createElement('span');
    userSpan.className = 'user';
    userSpan.textContent = user;
    div.appendChild(userSpan);
  }
  const textSpan = document.createElement('span');
  textSpan.className = 'text';
  textSpan.innerHTML = escapeHtml(text);
  div.appendChild(textSpan);
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.className = 'msg system';
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}
