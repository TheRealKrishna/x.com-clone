const express = require('express')
const app = express()
const http = require('http');
const mongoConnect = require("./database/connect.js")
const cors = require('cors');

// basic server inits
mongoConnect()
app.use(express.json())
app.use(cors());
const server = http.createServer(app);

// app routes
app.get('/', (req, res) => {
  res.send('Backend For x.com')
})
app.use("/api/auth", require("./api/auth.js"))
app.use("/api/post", require("./api/post.js"))


// server run
server.listen(80, () => {
  console.log(`Server Runinng on: http://localhost`)
})