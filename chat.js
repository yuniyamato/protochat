const socket = io();
const username = localStorage.getItem('username') || 'Anonymous';

const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

// Load messages in message section
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = 'message user';
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// When we receive messages history
socket.on('chat history', (messages) => {
  messages.forEach(msg => {
    appendMessage(msg.username, msg.text);
  });
});

// When another user send a message
socket.on('chat message', (data) => {
  appendMessage(data.username, data.text);
});

// Notification when a user join
socket.on('user joined', (user) => {
  const joinMsg = document.createElement('div');
  joinMsg.className = 'message join';
  joinMsg.textContent = `${user} has joined the chat.`;
  chatMessages.appendChild(joinMsg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Send a message to the server
function sendMessage() {
  const text = messageInput.value.trim();
  if (text === '') return;
  socket.emit('chat message', { username, text });
  messageInput.value = '';
}

// Send message when click on button or press enter
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Signale que l'utilisateur est connecté
socket.emit('user joined', username);
