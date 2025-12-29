import { useEffect, useState, useRef, useMemo } from "react";
import { useChatSocket } from "../hooks/useChatSocket";
import Profile from "./Profile";
import { PaperAirplaneIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");
  let navigate = useNavigate();

  const {
    fetchUser,
    user,
    userList,
    messages,
    isLoading,
    typingUsers,
    sendMessage,
    notifyTyping,
    markMessagesAsSeen,
  } = useChatSocket(selectedUser, setSelectedUser);

  const filteredMessages = useMemo(() => {
    if (!user || !selectedUser) return [];
    return messages.filter(
      (m) =>
        (m.senderId === user._id && m.receiverId === selectedUser._id) ||
        (m.senderId === selectedUser._id && m.receiverId === user._id)
    );
  }, [messages, selectedUser, user]);

  const chatMeta = useMemo(() => {
    const lastMessageMap = {};
    const deliveredCountMap = {};

    for (const m of messages) {
      const chatUserId = m.senderId === user._id ? m.receiverId : m.senderId;

      lastMessageMap[chatUserId] = m;

      if (
        m.senderId !== user._id &&
        m.receiverId === user._id &&
        m.status === "delivered"
      ) {
        deliveredCountMap[chatUserId] =
          (deliveredCountMap[chatUserId] || 0) + 1;
      }
    }

    return { lastMessageMap, deliveredCountMap };
  }, [messages, user._id]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);

    const unreadMsgs = messages.filter(
      (m) =>
        m.senderId === u._id && m.receiverId === user._id && m.status !== "seen"
    );
    markMessagesAsSeen(unreadMsgs);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (selectedUser && msg.trim()) {
      sendMessage(user._id, selectedUser._id, msg);
      setMsg("");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUser();

    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  return (
    <div className="relative h-screen md:flex text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-50">
      {/* User List */}
      <div
        className={`absolute inset-0 z-10  transform transition-transform duration-300 md:relative md:translate-x-0 md:w-1/3 md:z-0 ${
          selectedUser ? "-translate-x-full md:block" : "translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
          <div className="sticky top-0 z-20 p-4 flex items-center space-x-4 shadow dark:shadow-gray-800 bg-gray-50 dark:bg-gray-950">
            <Profile user={user} isLoading={isLoading} />
            <h3 className="text-2xl font-semibold text-orange-400 dark:text-orange-500 ">
              Convo
            </h3>
          </div>
          <div className="grow py-1 overflow-y-auto">
            {/* Skeleton loaders */}
            {isLoading ? (
              <div className="flex flex-col items-center h-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 px-4 py-3 w-full"
                  >
                    <div className="flex flex-row space-x-4">
                      <div className="bg-gray-300 dark:bg-gray-700 rounded-full h-12 w-12" />
                      <div className="flex flex-col justify-center">
                        <div className="bg-gray-300 dark:bg-gray-700 rounded h-4 w-32 mb-2" />
                        <div className="bg-gray-300 dark:bg-gray-700 rounded h-3 w-48" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              userList.map((u) => {
                const lastMsg = chatMeta.lastMessageMap[u._id];
                const deliveredCount = chatMeta.deliveredCountMap[u._id] || 0;

                return (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className={`cursor-pointer ${
                      selectedUser?._id === u._id
                        ? "bg-gray-200 dark:bg-gray-900"
                        : "hover:bg-gray-200 dark:hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between px-4 py-3 ">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={u.avatar || "/user.avif"}
                            className="w-12 h-12  rounded-full"
                          />
                          {u.isOnline && (
                            <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full border-1 border-white dark:border-gray-900 bg-orange-400 dark:bg-orange-500" />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-md dark:text-gray-50 text-gray-800 font-medium">
                            {u.name}
                          </span>

                          <span
                            className={`text-sm flex items-center gap-1 ${
                              typingUsers[u._id] &&
                              "text-orange-400 dark:text-orange-500 italic"
                            }`}
                          >
                            {typingUsers[u._id]
                              ? "typing..."
                              : lastMsg && (
                                  <>
                                    {lastMsg.senderId === user._id && (
                                      <span
                                        className={`flex ${
                                          lastMsg.status === "seen"
                                            ? "text-blue-500"
                                            : "text-gray-500 dark:text-gray-200"
                                        }`}
                                      >
                                        <CheckIcon className="h-4 w-4" />
                                        {(lastMsg.status === "delivered" ||
                                          lastMsg.status === "seen") && (
                                          <CheckIcon className="h-4 w-4 -ml-3" />
                                        )}
                                      </span>
                                    )}
                                    <span className="dark:text-gray-400 text-gray-500 truncate max-w-[270px]">
                                      {lastMsg.message}
                                    </span>
                                  </>
                                )}
                          </span>
                        </div>
                      </div>

                      {deliveredCount > 0 && (
                        <span className="dark:bg-orange-500 bg-orange-400 text-white text-sm font-semibold px-2 py-0.5 rounded-full">
                          {deliveredCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`absolute inset-0 z-10 shadow transform transition-transform duration-300 md:relative md:translate-x-0 md:w-2/3 md:z-0 ${
          selectedUser ? "translate-x-0" : "translate-x-full md:block hidden"
        }`}
      >
        {selectedUser ? (
          <div className=" flex flex-col h-full">
            <div className="sticky top-0 z-20 flex space-x-2 items-center p-2 h-16 shadow bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xl md:hidden"
              >
                &larr;
              </button>
              <img
                src={selectedUser.avatar || "/user.avif"}
                className="w-10 h-10 rounded-full"
              />
              <div className="p-2">
                <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                <p
                  className={`text-xs ${
                    selectedUser.isOnline
                      ? "text-orange-400 dark:text-orange-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {typingUsers[selectedUser._id]
                    ? "typing..."
                    : selectedUser.isOnline
                    ? "online"
                    : "offline"}
                </p>
              </div>
            </div>

            <div
              ref={messagesEndRef}
              className="bg-gray-200 dark:bg-gray-900 grow overflow-y-auto pt-2 px-2 "
            >
              {filteredMessages.map((m) => (
                <div
                  key={m._id}
                  className={`mb-1 flex ${
                    m.senderId === user._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-0.5 rounded-xl max-w-xs md:max-w-md flex items-center space-x-2 text-gray-900 dark:text-gray-50 ${
                      m.senderId === user._id
                        ? " bg-orange-400 dark:bg-orange-500"
                        : "bg-white shadow-sm dark:bg-gray-800"
                    }`}
                  >
                    <p className="text-md break-words whitespace-pre-wrap">
                      {m.message}
                    </p>
                    <div className="flex justify-end items-end space-x-1 pt-3 self-end">
                      <p className="text-xs text-gray-800 dark:text-gray-300 w-[50px]">
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {m.senderId === user._id && (
                        <div
                          className={`flex ${
                            m.status === "seen"
                              ? "text-blue-500"
                              : "text-gray-200"
                          }`}
                        >
                          <CheckIcon className="h-4 w-4" />
                          {(m.status === "delivered" ||
                            m.status === "seen") && (
                            <CheckIcon className="h-4 w-4 -ml-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex flex-row items-end p-1 md:pb-2 space-x-1 bg-gray-200 dark:bg-gray-900"
            >
              <textarea
                value={msg}
                onChange={(e) => {
                  setMsg(e.target.value);
                  notifyTyping(selectedUser._id);

                  // Auto resize
                  e.target.style.height = "auto"; // reset height
                  const maxHeight = 100; // max height in px
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, maxHeight) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                className="flex-1 resize-none overflow-y-auto shadow px-4 py-2 rounded-2xl 
                text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800
                focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-orange-500"
                placeholder="Type a message..."
                style={{ minHeight: "44px", maxHeight: "100px" }}
              />
              <button type="submit">
                <PaperAirplaneIcon className="h-11 w-11 rounded-full bg-orange-500 text-white p-2 hover:bg-orange-600" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-900">
            <div className="text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 px-2 py-1 rounded-2xl shadow">
              <h1> Select a user to start chatting.</h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
