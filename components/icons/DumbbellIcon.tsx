import React from 'react';

const DumbbellIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6.5 6.5 11 11"/>
    <path d="m21 21-1-1"/>
    <path d="m3 3 1 1"/>
    <path d="m18 22 4-4"/>
    <path d="m6 8-4 4"/>
    <path d="m19 5-3-3"/>
    <path d="m5 19 3 3"/>
    <path d="M16 8.5 19 12l-2.5 2.5"/>
    <path d="M8.5 16 12 19l2.5-2.5"/>
  </svg>
);

export default DumbbellIcon;
