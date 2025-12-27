import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  auth: { token: localStorage.getItem("token") },
  autoConnect: false, 
});
export default socket
