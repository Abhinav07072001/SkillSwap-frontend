// src/routes/Feedback.jsx
import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase';
import { ref, push, onValue } from 'firebase/database';
import AuthContext from '../contexts/AuthContext';

export default function Feedback(){
  const { user } = useContext(AuthContext);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [items, setItems] = useState([]);

  useEffect(()=> {
    const refFb = ref(db, 'feedback');
    const unsub = onValue(refFb, snap => {
      setItems(snap.exists() ? Object.entries(snap.val()).map(([k,v]) => ({ id: k, ...v })) : []);
    });
    return () => unsub();
  }, []);

  const submit = async () => {
    await push(ref(db, 'feedback'), { user: user.uid, comment, rating, createdAt: Date.now() });
    setComment(''); setRating(5);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h3 className="text-lg font-semibold">Leave feedback</h3>
        <div className="mt-3">
          <textarea className="input h-24" value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="How was the session?" />
          <div className="mt-2 flex gap-2 items-center">
            <select className="input w-24" value={rating} onChange={(e)=>setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn" onClick={submit}>Submit</button>
          </div>
        </div>
      </div>

      <div className="mt-4 card">
        <h3 className="text-lg font-semibold">Recent feedback</h3>
        <div className="mt-2 space-y-2">
          {items.map(i => <div key={i.id} className="p-2 border rounded">
            <div className="text-sm">{i.comment}</div>
            <div className="text-xs text-gray-500">Rating: {i.rating}</div>
          </div>)}
        </div>
      </div>
    </div>
  );
}
