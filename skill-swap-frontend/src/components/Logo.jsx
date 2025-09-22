// src/components/Logo.jsx
import React from 'react';
export default function Logo({ className = 'h-10 w-10' }) {
  return <img src="/logo.svg" alt="SkillSwap" className={className} />;
}
