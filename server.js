const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = {};
let messages = [];

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user-joined', username);
    socket.emit('history', messages);
  });

  socket.on('chat-message', (msg) => {
    const message = { user: users[socket.id], text: msg };
    messages.push(message);
    io.emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      io.emit('user-left', users[socket.id]);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
