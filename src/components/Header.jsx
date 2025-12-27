import useDarkMode from "../hooks/useDarkMode";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function Header() {
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <header className="bg-gradient-to-r from-orange-600 to-orange-400 dark:from-gray-900 dark:to-gray-700 p-4 flex justify-between items-center shadow-md transition-colors">
      <a
        href="/"
        className="text-2xl font-semibold text-white dark:text-orange-400 tracking-wide drop-shadow"
      >
        Convo - Chat App
      </a>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="rounded-full hover:scale-105 transition-transform"
      >
        {darkMode ? (
          <SunIcon className="h-6 w-6 text-yellow-400" />
        ) : (
          <MoonIcon className="h-6 w-6 text-white" />
        )}
      </button>
    </header>
  );
}
