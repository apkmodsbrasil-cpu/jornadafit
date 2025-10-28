import React from 'react';

const WandIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4V2" />
        <path d="M15 10v-2" />
        <path d="M15 16v-2" />
        <path d="m12.3 6.7.6-1.4.6 1.4" />
        <path d="m5.3 11.7.6-1.4.6 1.4" />
        <path d="m19.3 11.7.6-1.4.6 1.4" />
        <path d="M18 13.5 15 22l-3-8.5" />
        <path d="M9 13.5 6 22l-3-8.5" />
        <path d="M12 6h.01" />
        <path d="M5 11h.01" />
        <path d="M19 11h.01" />
    </svg>
);

export default WandIcon;
