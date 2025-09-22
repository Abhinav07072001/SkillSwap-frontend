// src/components/DarkToggle.jsx
import React, { useEffect, useState } from 'react';
export default function DarkToggle(){
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  useEffect(()=> { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  return (
    <button onClick={()=>setDark(!dark)} className="px-2 py-1 rounded border">
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
