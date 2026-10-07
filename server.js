const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

const messageHistory = [];

io.on('connection', (socket) => {
  socket.emit('init_history', messageHistory);

  socket.on('send_message', (data) => {
    const packet = {
      id: Date.now().toString(),
      sender: data.sender || 'Anonymous',
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messageHistory.push(packet);
    if (messageHistory.length > 50) messageHistory.shift();
    io.emit('new_message', packet);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server live on port ${PORT}`));
