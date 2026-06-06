import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { WS_URL } from "../api/config";

/**
 * Maintains a single Socket.IO connection for the logged-in user and exposes
 * a tiny event bus. Components subscribe to server events (newMessage,
 * notification, typing, messagesRead) without each opening their own socket.
 *
 * Returns: { socket, on, emit, connected }
 */
export function useRealtime(userId) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;

    const socket = io(WS_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", userId);
    });
    socket.on("disconnect", () => setConnected(false));

    // Re-announce identity on reconnect.
    socket.io.on("reconnect", () => socket.emit("join", userId));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // Subscribe helper that returns an unsubscribe function.
  const on = (event, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  };

  const emit = (event, payload) => {
    socketRef.current?.emit(event, payload);
  };

  return { socket: socketRef, on, emit, connected };
}
