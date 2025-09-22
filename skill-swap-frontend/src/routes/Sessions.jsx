// src/routes/Sessions.jsx
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import { db } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";

export default function Sessions() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const prefill = location.state?.prefill || null;

  const [title, setTitle] = useState(prefill ? `Learn ${prefill.skill}` : "");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [zoomLink, setZoomLink] = useState("");
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const sessionsRef = ref(db, "sessions");
    const unsub = onValue(sessionsRef, (snap) => {
      setSessions(
        snap.exists()
          ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v }))
          : []
      );
    });
    return () => unsub();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const sref = ref(db, "sessions");
    await push(sref, {
      title,
      host: prefill?.hostId || user.uid,
      hostName: prefill?.hostName || user.displayName || user.email,
      participants: { [user.uid]: true },
      startTime: dayjs(startTime).valueOf(),
      durationMinutes: Number(duration),
      mode: "online",
      status: "scheduled",
      zoomLink: zoomLink || "", // ✅ always include key
      createdAt: Date.now(),
    });
    setTitle("");
    setStartTime("");
    setDuration(60);
    setZoomLink("");
  };

  const mySessions = sessions.filter((s) => s.host === user.uid);
  const upcomingSessions = sessions.filter((s) => s.host !== user.uid);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Create Session */}
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          📅 Create a Skill Session
        </h3>
        <form className="mt-4 grid gap-3" onSubmit={create}>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Session Title
            </label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g. Learn React Basics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Start Time
            </label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Duration (minutes)
            </label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              type="number"
              min="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* ✅ Zoom Link Input */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Zoom Link
            </label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              type="url"
              placeholder="https://zoom.us/j/xxxxxxx"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              required
            />
          </div>

          <button className="btn bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white mt-2">
            {prefill ? "Confirm & Create Session" : "Create Session"}
          </button>
        </form>
      </div>

      {/* My Sessions */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          My Sessions
        </h3>
        <div className="mt-3 space-y-3">
          {mySessions.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              You haven’t created any sessions yet.
            </div>
          )}
          {mySessions.map((s) => (
            <div
              key={s.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-700 dark:text-white">
                    {s.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {dayjs(s.startTime).format("DD MMM YYYY, HH:mm")} •{" "}
                    {s.durationMinutes} min
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  Host
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Sessions */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Explore Upcoming Sessions
        </h3>
        <div className="mt-3 space-y-3">
          {upcomingSessions.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No sessions available yet. Be the first to create one!
            </div>
          )}
          {upcomingSessions.map((s) => (
            <div
              key={s.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-700 dark:text-white">
                    {s.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    By {s.hostName || "Anonymous"} •{" "}
                    {dayjs(s.startTime).format("DD MMM YYYY, HH:mm")} •{" "}
                    {s.durationMinutes} min
                  </div>
                </div>

                {/* ✅ Join button for Zoom */}
                {s.zoomLink && s.zoomLink.trim() !== "" ? (
                  <a
                    href={s.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-green-600 hover:bg-green-700 active:scale-95 transition text-white"
                  >
                    Join
                  </a>
                ) : (
                  <button
                    className="btn bg-gray-400 text-white cursor-not-allowed"
                    disabled
                  >
                    No Link
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
