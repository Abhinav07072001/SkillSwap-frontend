// src/routes/Home.jsx
import React, { useContext, useEffect, useState } from "react";
import Logo from "../components/Logo";
import AuthContext from "../contexts/AuthContext";
import { db } from "../firebase";
import { ref, push, onValue, remove, update } from "firebase/database";
import { HeartIcon, ChatBubbleOvalLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    const postsRef = ref(db, "posts");
    const unsub = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const postsArray = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        postsArray.sort((a, b) => b.timestamp - a.timestamp);
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
    });
    return () => unsub();
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      alert("Post content cannot be empty!");
      return;
    }
    setLoadingPost(true);
    try {
      const postsRef = ref(db, "posts");
      await push(postsRef, {
        authorId: user.uid,
        authorName: user.displayName || user.email.split("@")[0],
        content: postContent.trim(),
        timestamp: Date.now(),
        likes: {},
        comments: {},
      });
      setPostContent("");
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post. Check console.");
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    remove(ref(db, `posts/${postId}`));
  };

  const handleToggleLike = (post) => {
    const likes = post.likes || {};
    const postRef = ref(db, `posts/${post.id}/likes`);
    if (likes[user.uid]) {
      update(postRef, { [user.uid]: null });
    } else {
      update(postRef, { [user.uid]: true });
    }
  };

  const handleAddComment = (postId, commentText, clearInput) => {
    if (!commentText.trim()) return;
    const commentsRef = ref(db, `posts/${postId}/comments`);
    push(commentsRef, {
      authorId: user.uid,
      authorName: user.displayName || user.email.split("@")[0],
      text: commentText.trim(),
      timestamp: Date.now(),
    }).then(() => clearInput());
  };

  const handleDeleteComment = (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    remove(ref(db, `posts/${postId}/comments/${commentId}`));
  };

  const formatTime = (ts) => new Date(ts).toLocaleString();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="inline-flex items-center gap-4 mb-4">
        <Logo className="h-16 w-16" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SkillSwap</h1>
          <p className="text-gray-600 dark:text-gray-400">Learn by swapping skills — one session at a time.</p>
        </div>
      </div>

      {/* Create Post Button */}
      {user && (
        <div className="text-right">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Create Post
          </button>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center">No posts yet — be the first to share something!</div>
        )}

        {posts.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700 transition-colors"
          >
            {/* Author + Timestamp */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900 dark:text-gray-100">{p.authorName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(p.timestamp)}</div>
            </div>

            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 mb-3">{p.content}</p>

            {/* Actions: Like / Comment / Delete */}
            <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-2">
              <button
                onClick={() => handleToggleLike(p)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition ${
                  p.likes && p.likes[user?.uid]
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                <HeartIcon className="h-5 w-5" />
                {p.likes ? Object.keys(p.likes).length : 0}
              </button>

              <button
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                {p.comments ? Object.keys(p.comments).length : 0}
              </button>

              {user && user.uid === p.authorId && (
                <button
                  onClick={() => handleDeletePost(p.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-500 transition hover:bg-red-600 hover:text-white"
                >
                  <TrashIcon className="h-5 w-5" />
                  Delete
                </button>
              )}
            </div>

            {/* Comments */}
            <div className="mt-3 space-y-2">
              {p.comments &&
                Object.entries(p.comments).map(([cid, c]) => (
                  <div key={cid} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{c.authorName}: </span>
                      <span className="text-gray-700 dark:text-gray-300">{c.text}</span>
                    </div>
                    {user && user.uid === c.authorId && (
                      <button onClick={() => handleDeleteComment(p.id, cid)} className="text-red-600 hover:text-red-800">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

              {user && <AddCommentInput postId={p.id} handleAddComment={handleAddComment} />}
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Create Post</h2>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={5}
              placeholder="Share something with the community..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={loadingPost}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {loadingPost ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Comment Input Component
function AddCommentInput({ postId, handleAddComment }) {
  const { user } = useContext(AuthContext);
  const [commentText, setCommentText] = useState("");

  const clearInput = () => setCommentText("");

  if (!user) return null;

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder="Add a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      />
      <button
        onClick={() => handleAddComment(postId, commentText, clearInput)}
        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
      >
        Comment
      </button>
    </div>
  );
}
