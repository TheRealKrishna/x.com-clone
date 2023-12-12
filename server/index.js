const express = require('express')
const http = require('http');
const mongoConnect = require("./database/connect.js")
const cors = require('cors');
const app = express()
const { Server } = require('socket.io');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = new socketIo.Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL
  }
});

// basic server inits
mongoConnect()
app.use(express.json())
app.use(cors());

const rooms = {};
io.on('connection', (socket) => {
  socket.on('join', (user) => {
    rooms[user] = socket.id;
    console.log(`a user joined with id ${user} and socket id ${socket.id}`)
  });

  socket.on('sendMessage', (user) => {
    if (rooms[user]) {
      io.to(rooms[user]).emit('newMessage');
    }
  });

  socket.on('disconnect', () => {
    const user = Object.keys(rooms).find((key) => rooms[key] === socket.id);
    if (user) {
      delete rooms[user];
    }
    console.log(`deleted user ${user} because user disconnected!`);
  });
});

// app routes
app.get('/api', (req, res) => {
  res.send('Backend For x.com')
})
app.use("/api/auth", require("./api/auth.js"))
app.use("/api/post", require("./api/post.js"))
app.use("/api/follow", require("./api/follow.js"))
app.use("/api/chat", require("./api/chat.js"))


// server run
server.listen(80, () => {
  console.log(`Server Runinng on: http://localhost`)
})