import React from 'react';

const GraphIconV2: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18.7 8a6 6 0 0 0-4.9-4.9" />
        <path d="M4 16.7A6 6 0 0 1 8.9 12" />
    </svg>
);

export default GraphIconV2;