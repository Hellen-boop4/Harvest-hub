import { io } from "socket.io-client";

// infer the correct socket.io-client type automatically
const socket = io({
  autoConnect: true
});

export default socket;
