import React from 'react';

const RoadmapIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17V7" />
      <path d="M8 17V7" />
      <path d="M12 17V7" />
      <path d="M16 17V7" />
      <path d="M20 17V7" />
      <path d="M4 12h16" />
    </svg>
);

export default RoadmapIcon;
