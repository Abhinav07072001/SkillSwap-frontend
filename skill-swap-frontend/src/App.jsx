// src/App.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Profile from "./routes/Profile";
import Match from "./routes/Match";
import Sessions from "./routes/Sessions";
import Feedback from "./routes/Feedback";
import AuthContext from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext"; // ✅ added
// import Dashboard from "./routes/Dashboard";

export default function App() {
  const { user, loading } = useContext(AuthContext);
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
        <Navbar />
        <main className="max-w-5xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/match"
              element={user ? <Match /> : <Navigate to="/login" />}
            />
            <Route
              path="/sessions"
              element={user ? <Sessions /> : <Navigate to="/login" />}
            />
            <Route
              path="/feedback"
              element={user ? <Feedback /> : <Navigate to="/login" />}
            />
            {/* <Route path="/dashboard" element={<Dashboard />} /> ✅ */}
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}
