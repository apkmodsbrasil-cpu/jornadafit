import React from 'react';

const RadarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <path d="M16.2 7.8c-2.3-2.3-6-2.3-8.4 0" />
        <path d="M19.1 4.9C15.2 1 8.8 1 4.9 4.9" />
        <path d="M22 12c0 6-4 9-9 9s-9-3-9-9" />
    </svg>
);

export default RadarIcon;