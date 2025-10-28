import React from 'react';

const ClipboardIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V14c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h1.8c.4 0 .8.2 1.1.5.3.3.5.7.5 1.1v2.9c0 .4-.2.8-.5 1.1-.3.3-.7.5-1.1.5H6.5c-.4 0-.8-.2-1.1-.5-.3.3-.5-.7-.5-1.1V4.5c0-.4.2-.8.5-1.1.3-.3.7-.5 1.1-.5h1.8" />
    <path d="M15.5 2v14h1.8c.4 0 .8.2 1.1.5.3.3.5.7.5 1.1v2.9c0 .4-.2.8-.5 1.1-.3.3-.7.5-1.1.5H10.4c-.4 0-.8-.2-1.1-.5-.3-.3-.5-.7-.5-1.1V18c0-.4.2-.8.5-1.1.3-.3.7-.5 1.1-.5h1.8c.4 0 .8.2 1.1-.5.3-.3.5-.7.5-1.1V3.5c0-.4-.2.8-.5-1.1-.3-.3-.7-.5-1.1-.5h-1.8" />
  </svg>
);

export default ClipboardIcon;
