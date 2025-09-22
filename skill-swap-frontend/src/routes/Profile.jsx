// src/routes/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import { updateProfile } from "firebase/auth";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState(3);

  useEffect(() => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    const unsub = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setProfile(data);
        setBio(data.bio || "");
        setName(data.name || user.displayName || "");
      }
    });
    return () => unsub();
  }, [user]);

  // ✅ Save Bio
  const saveBio = async () => {
    await update(ref(db, `users/${user.uid}`), { bio });
    alert("Bio saved successfully!");
  };

  // ✅ Save Name (Auth + DB)
  const saveName = async () => {
    if (!name.trim()) {
      alert("Name cannot be empty!");
      return;
    }
    try {
      // Update Firebase Auth displayName
      await updateProfile(user, { displayName: name });

      // Update Realtime DB
      await update(ref(db, `users/${user.uid}`), { name });

      alert("Name updated successfully!");
    } catch (err) {
      alert("Error updating name: " + err.message);
    }
  };

  // ✅ Add offered skill
  const addOffered = async () => {
    if (!skillName.trim()) {
      alert("Enter a skill name");
      return;
    }
    const key = `skill_${Date.now()}`;
    await update(ref(db, `users/${user.uid}/skillsOffered/${key}`), {
      name: skillName,
      level,
    });
    setSkillName("");
    setLevel(3);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Profile
        </h3>

        {/* Name + Email */}
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your name"
            />
            <button
              onClick={saveName}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Save Name
            </button>
          </div>

          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Write a short bio..."
            rows={4}
          />
          <button
            onClick={saveBio}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Save Bio
          </button>
        </div>
      </div>

      {/* Skills Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Skills You Offer
        </h3>

        <div className="space-y-2">
          {profile?.skillsOffered ? (
            Object.entries(profile.skillsOffered).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg"
              >
                <span className="text-gray-800 dark:text-gray-200">
                  {v.name} — Level {v.level}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No skills added yet.
            </div>
          )}
        </div>

        {/* Add new skill */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <input
            className="col-span-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Skill name"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />
          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            <option value={1}>1 - Beginner</option>
            <option value={2}>2 - Novice</option>
            <option value={3}>3 - Intermediate</option>
            <option value={4}>4 - Advanced</option>
            <option value={5}>5 - Expert</option>
          </select>
          <button
            className="col-span-3 mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            onClick={addOffered}
          >
            Add Offered Skill
          </button>
        </div>
      </div>
    </div>
  );
}
