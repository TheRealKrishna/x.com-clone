const { Server } = require("socket.io");
const config = require("../config");

let io = null;
// Map of userId -> Set of socket ids (a user may have multiple tabs/devices).
const userSockets = new Map();

function addSocket(userId, socketId) {
  if (!userId) return;
  const key = String(userId);
  if (!userSockets.has(key)) userSockets.set(key, new Set());
  userSockets.get(key).add(socketId);
}

function removeSocket(socketId) {
  for (const [userId, sockets] of userSockets.entries()) {
    if (sockets.delete(socketId) && sockets.size === 0) {
      userSockets.delete(userId);
    }
  }
}

/**
 * Initialize Socket.IO on the given HTTP server and wire up connection handlers.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (config.frontendUrls.includes("*")) return callback(null, true);
        if (config.frontendUrls.includes(origin)) return callback(null, true);
        if (!config.isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Client announces which user it represents.
    socket.on("join", (userId) => {
      socket.data.userId = userId;
      addSocket(userId, socket.id);
    });

    // Typing indicator relay.
    socket.on("typing", ({ to, from, isTyping }) => {
      emitToUser(to, "typing", { from, isTyping });
    });

    socket.on("disconnect", () => {
      removeSocket(socket.id);
    });
  });

  return io;
}

/**
 * Emit an event to every socket belonging to a given user.
 */
function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  const sockets = userSockets.get(String(userId));
  if (!sockets) return;
  for (const socketId of sockets) {
    io.to(socketId).emit(event, payload);
  }
}

function isUserOnline(userId) {
  return userSockets.has(String(userId));
}

module.exports = { initSocket, emitToUser, isUserOnline };
