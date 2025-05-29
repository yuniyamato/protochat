const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const messagesFile = path.join(__dirname, 'messages.json');

if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, '[]');
}

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Nouvel utilisateur connecté');

  // Hystory
  const history = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
  socket.emit('chat history', history);

  // When user join
  socket.on('user joined', (username) => {
    console.log(`${username} a rejoint le chat`);
    socket.broadcast.emit('user joined', username);
  });

  // When a message is sent
  socket.on('chat message', (data) => {
    console.log(`Message de ${data.username}: ${data.text}`);

    const history = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
    history.push({
      username: data.username,
      text: data.text,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(messagesFile, JSON.stringify(history, null, 2));

    // Envoyer le message à tous les clients connectés
    io.emit('chat message', data);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});