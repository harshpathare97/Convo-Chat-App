import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import { useNavigate } from "react-router-dom";

export const useChatSocket = (selectedUser, setSelectedUser) => {
  const [user, setUser] = useState({});
  const [userList, setUserList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const selectedUserRef = useRef(null);
  const token = localStorage.getItem("token");
  let navigate = useNavigate();

  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play();
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      socket.emit("user_list");
    });

    socket.on("user_list", (users) => {
      setUserList(users.filter((u) => u._id !== user._id));
      setSelectedUser((prevSelected) => {
        if (!prevSelected) return null;
        const updated = users.find((u) => u._id === prevSelected._id);
        return updated || prevSelected;
      });
    });

    socket.on("message_receive", (msg) => {
      const currentUser = selectedUserRef.current;

      if (currentUser && currentUser._id === msg.senderId) {
        const updatedMsg = {
          ...msg,
          status: "seen",
        };

        setMessages((prev) => [...prev, updatedMsg]);
        socket.emit("message_seen", {
          receiverId: msg.senderId,
          messageId: msg._id,
          status: "seen",
        });
      } else {
        const updatedMsg = {
          ...msg,
          status: "delivered",
        };

        setMessages((prev) => [...prev, updatedMsg]);
        const senderName = userList.find((u) => u._id === msg.senderId).name;
        if (Notification.permission === "granted") {
          new Notification(`New message from ${senderName}`, {
            body: msg.message,
            icon: "/chat.svg",
          });
        }
        playSound();

        socket.emit("message_delivered", {
          receiverId: msg.senderId,
          messageId: msg._id,
          status: "delivered",
        });
      }
    });

    socket.on("message_delivered", ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    });

    socket.on("message_seen", ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    });

    socket.on("user_typing", (senderId) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const copy = { ...prev };
          delete copy[senderId];
          return copy;
        });
      }, 2000);
    });

    return () => {
      socket.off("connect");
      socket.off("user_list");
      socket.off("user_typing");
      socket.off("acknowledgment");
      socket.off("message_receive");
      socket.off("message_delivered");
      socket.off("message_seen");
      socket.off("disconnect");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUser = async () => {
    setIsLoading(true);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setIsLoading(false);
    if (data.error) {
      alert(data.error);
      navigate("/login");
      return;
    }
    setUser(data.user);
    setUserList(data.userList);

    const deliveredToEmit = [];

    const updatedMessages = data.userMessages.map((m) => {
      if (m.receiverId === data.user._id && m.status === "sent") {
        deliveredToEmit.push(m);
        return { ...m, status: "delivered" };
      }
      return m;
    });

    setMessages(updatedMessages);

    deliveredToEmit.forEach((msg) => {
      socket.emit("message_delivered", {
        receiverId: msg.senderId,
        messageId: msg._id,
        status: "delivered",
      });
    });
  };

  const updateMessageStatus = (messageId, status) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
    );
  };

  const sendMessage = (senderId, receiverId, message) => {
    socket.emit(
      "message_send",
      {
        senderId: senderId,
        receiverId: receiverId,
        message,
        status: "sent",
      },
      (savedMsg) => {
        setMessages((prev) => [...prev, savedMsg]);
      }
    );
  };

  const notifyTyping = (receiverId) => {
    socket.emit("user_typing", receiverId);
  };

  const markMessagesAsSeen = (msgs) => {
    msgs.forEach((msg) => {
      socket.emit("message_seen", {
        receiverId: msg.senderId,
        messageId: msg._id,
        status: "seen",
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, status: "seen" } : m))
      );
    });
  };

  return {
    fetchUser,
    user,
    userList,
    setUserList,
    messages,
    setMessages,
    isLoading,
    typingUsers,
    sendMessage,
    notifyTyping,
    markMessagesAsSeen,
  };
};
