const path = require('path');
const http = require('http');

const express = require('express');
const app = express();

const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const botName = 'Chat room bot';

const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/users');

app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', (socket) => {

  socket.on('Join Room', ({ username, room }) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit(
      'message',
      formatMessage(
        botName,
        'Welcome to Chat Room! This is a group chatting platform!'
      )
    );

    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(botName, `${user.username} has joined the chat`));


    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });


    socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
      const user = userLeaves(socket.id);

      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        );

        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
});

// fire up server
server.listen(PORT, () => console.log(`server up on port ${PORT}`));
