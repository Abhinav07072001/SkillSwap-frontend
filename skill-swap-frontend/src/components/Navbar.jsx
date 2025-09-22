import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import AuthContext from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useContext } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useTheme();
  const nav = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    nav("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4 sm:p-6">
        {/* Logo + Brand */}
        <Link
          to="/"
          className="flex items-center gap-4 hover:scale-105 transition-transform duration-300"
        >
          <Logo className="h-12 w-12 sm:h-14 sm:w-14" />
          <span className="text-2xl sm:text-3xl font-bold tracking-wide text-gray-900 dark:text-white">
            SkillSwap
          </span>
        </Link>

        {/* Nav Links + Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {user && (
            <>
              <Link
                to="/match"
                className="hidden sm:inline text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Match
              </Link>
              <Link
                to="/sessions"
                className="hidden sm:inline text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Sessions
              </Link>
              <Link
                to="/profile"
                className="hidden sm:inline text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Profile
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm sm:text-base font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Auth Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium truncate max-w-[100px] sm:max-w-[150px]">
                {user.displayName || user.email}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm sm:text-base font-semibold hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm sm:text-base font-semibold hover:bg-blue-600 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
