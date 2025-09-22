// src/routes/Match.jsx
import React, { useState, useContext } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import AuthContext from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Match() {
  const { user } = useContext(AuthContext);
  const [skill, setSkill] = useState("");
  const [wantLevel, setWantLevel] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewUser, setViewUser] = useState(null); // ✅ For modal
  const navigate = useNavigate();

  const computeScore = (candidate, offeredLevel, wantLevel, sessionsCount = 0) => {
    let score = 0;
    score += 50;
    score += Math.max(-10, offeredLevel - wantLevel) * 8;
    score += offeredLevel * 2;
    if (candidate.bio) score += 10;
    score += (sessionsCount || 0) * 2;
    return Math.max(0, Math.round(score));
  };

  const handleSearch = async () => {
    if (!skill.trim()) {
      alert("Enter a skill name to search");
      return;
    }
    setLoading(true);
    try {
      const [usersSnap, sessionsSnap] = await Promise.all([
        get(ref(db, "users")),
        get(ref(db, "sessions")),
      ]);
      const users = usersSnap.exists() ? usersSnap.val() : {};
      const sessions = sessionsSnap.exists() ? sessionsSnap.val() : {};

      const hostCounts = {};
      if (sessions) {
        Object.values(sessions).forEach((s) => {
          if (s.host) hostCounts[s.host] = (hostCounts[s.host] || 0) + 1;
        });
      }

      const matches = [];
      const skillLower = skill.trim().toLowerCase();

      Object.entries(users).forEach(([uid, u]) => {
        if (!u.skillsOffered) return;
        const offeredArr = Object.values(u.skillsOffered);
        const offered = offeredArr.find(
          (s) => s?.name && s.name.trim().toLowerCase() === skillLower
        );
        if (!offered) return;

        const sessionsCount = hostCounts[uid] || 0;
        const score = computeScore(u, offered.level || 1, wantLevel, sessionsCount);

        const displayName =
          u.name || u.displayName || u.email?.split("@")[0] || "Unknown";

        matches.push({
          uid,
          name: displayName,
          bio: u.bio || "",
          offered,
          score,
          sessionsCount,
          skillsOffered: u.skillsOffered,
        });
      });

      matches.sort((a, b) => b.score - a.score);
      setResults(matches);
    } catch (err) {
      console.error("Match search failed", err);
      alert("Search failed, check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = (candidate) => {
    navigate("/sessions", {
      state: {
        prefill: {
          hostId: candidate.uid,
          hostName: candidate.name,
          skill: candidate.offered.name,
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Find people who can teach
        </h3>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <input
            placeholder="Skill (e.g. React)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
          />
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Desired level
            </label>
            <select
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={wantLevel}
              onChange={(e) => setWantLevel(Number(e.target.value))}
            >
              <option value={1}>1 - Beginner</option>
              <option value={2}>2 - Novice</option>
              <option value={3}>3 - Intermediate</option>
              <option value={4}>4 - Advanced</option>
              <option value={5}>5 - Expert</option>
            </select>
          </div>
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        <div className="mt-6">
          {results.length === 0 && !loading && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No results yet — try a different skill
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {results.map((r) => (
              <div
                key={r.uid}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow 
                           border border-gray-200 dark:border-gray-700 
                           hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 
                                  flex items-center justify-center text-lg font-bold 
                                  text-blue-700 dark:text-blue-300">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {r.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {r.offered.name} — level {r.offered.level}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {r.score}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {r.bio ? r.bio.slice(0, 120) : "No bio yet."}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm 
                                   hover:bg-blue-700 transition"
                        onClick={() => handleSchedule(r)}
                      >
                        Schedule
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 
                                   text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                                   dark:hover:bg-gray-700 transition"
                        onClick={() => setViewUser(r)} // ✅ Open modal
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 font-bold text-lg"
              onClick={() => setViewUser(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {viewUser.name}'s Profile
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-medium">Bio:</span> {viewUser.bio || "No bio available."}
            </p>
            <div className="mb-2">
              <span className="font-medium text-gray-800 dark:text-gray-200">Skills Offered:</span>
              <ul className="mt-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                {viewUser.skillsOffered
                  ? Object.values(viewUser.skillsOffered).map((s, i) => (
                      <li key={i}>
                        {s.name} — Level {s.level}
                      </li>
                    ))
                  : "No skills added yet."}
              </ul>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sessions Hosted: {viewUser.sessionsCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Score: {viewUser.score}
            </p>
            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                onClick={() => setViewUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
