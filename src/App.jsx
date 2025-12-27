import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./components/Chat";
import Login from "./components/Login";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import socket from "./services/socket";

function OfflineFallback() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 text-sm flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold mb-2">You’re Offline</h1>
      <p>Please check your network.</p>
      <p>Messages will sync once you’re back online</p>
    </div>
  );
}

function App() {
  const online = useOnlineStatus();
  socket.disconnect();

  if (!online) {
    return <OfflineFallback />;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
