import React from "react";
import useDarkMode from "../hooks/useDarkMode";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";

export default function Profile({ user, isLoading }) {
  const [modal, setModal] = React.useState(false);
  const [darkMode, setDarkMode] = useDarkMode();

  let navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    socket.disconnect();
  };

  return (
    <div>
      <Bars3Icon
        className="h-6 w-6 mx-2 cursor-pointer text-gray-900 dark:text-gray-50 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        onClick={() => (isLoading ? setModal(false) : setModal(true))}
      />
      {modal && (
        <div
          className="fixed inset-0 z-40 max-w-80 flex justify-start"
          onClick={() => setModal(false)}
        >
          <div
            className="bg-gray-200 dark:bg-gray-900 p-6 z-50 w-full max-w-md shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-3xl hover:text-gray-500 text-gray-900 dark:text-gray-50 transition-colors"
              onClick={() => setModal(false)}
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={user.avatar || "/user.avif"}
                className="w-24 h-24 rounded-full mb-4 border-4 border-orange-400 dark:border-orange-500"
              />
              <div className="w-full text-gray-900 dark:text-gray-50 space-y-4">
                <div className="border-b">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-50"
                  >
                    Name
                  </label>
                  <div className="block w-full p-2 rounded-md">
                    <p>{user.name}</p>
                  </div>
                </div>
                <div className="border-b">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-50"
                  >
                    Email
                  </label>
                  <div className="block w-full p-2 rounded-md">
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <label className="font-semibold text-gray-900 dark:text-gray-50">
                    Dark Mode
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    {/* Hidden checkbox */}
                    <input
                      type="checkbox"
                      role="switch"
                      className="sr-only"
                      onChange={() => setDarkMode(!darkMode)}
                    />

                    {/* Switch */}
                    <div
                      className={`w-11 h-6 rounded-full transition-colors duration-300 
        ${darkMode ? "bg-green-500" : "bg-gray-400"}`}
                    >
                      <div
                        className={`h-5 w-5 mt-0.5 bg-white rounded-full shadow transform transition-transform duration-300
          ${darkMode ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </div>
                  </label>
                </div>
                <button
                  className="mt-2 font-bold text-red-500 hover:text-red-600 transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
