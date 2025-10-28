import React from 'react';

const VideoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10l-4-4-4 4"></path>
        <path d="M2 14l4 4 4-4"></path>
        <path d="M18 6l-4-4-4 4"></path>
        <path d="M6 18l4 4 4-4"></path>
        <path d="M18 6V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2"></path>
        <path d="M6 18v2a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
    </svg>
);

export default VideoIcon;