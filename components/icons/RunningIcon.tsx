import React from 'react';

const RunningIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="4.5" r="2.5"></circle>
    <path d="M14 11.5 8 18h2l2-3 4 3 2-2-3-4-1-2-3-2z"></path>
    <path d="m7 12-2 3-1 1"></path>
  </svg>
);

export default RunningIcon;
