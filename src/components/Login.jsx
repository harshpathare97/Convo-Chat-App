import React from "react"
import { GoogleLogin } from "@react-oauth/google";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [input, setInput] = React.useState("")
  const [isShown, setIsShown] = React.useState(false)
  let navigate = useNavigate();

  const handleSubmit = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleId: input }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    localStorage.setItem("token", data.token);
    navigate("/");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-orange-200 dark:border-gray-700 animate-fade-in transition-colors">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-extrabold text-orange-500 dark:text-orange-400 drop-shadow-lg tracking-wide mb-2">
              Welcome!
            </h2>
            <p className="text-gray-500 dark:text-gray-300 text-lg">
              Sign in to continue to Convo App
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <GoogleLogin
              onSuccess={async (credRes) => {
                const res = await fetch(
                  `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: credRes.credential }),
                  }
                );
                const data = await res.json();
                if (data.error) {
                  alert(data.error);
                  return;
                }
                localStorage.setItem("token", data.token);
                console.log(data.token);
                navigate("/");
              }}
              onError={() => console.log("Login Failed")}
              theme="filled_blue"
              shape="pill"
              size="large"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Your credentials are safe with us.
            </span>
            <button
              onClick={() => setIsShown(!isShown)}
              className="text-sm text-orange-500 hover:underline"
            >
              {isShown ? "Hide Demo Login" : "Use Demo Login"}
            </button>
            {isShown && (
              <div className="flex flex-col items-center space-y-3">
                <input
                  type="text"
                  placeholder="Enter ID for Demo Login"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 dark:bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 w-full bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
