import React from 'react';

interface ToggleProps {
  id: string;
  name?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ id, name, checked, onChange, className = '' }) => {
  return (
    <label htmlFor={id} className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input type="checkbox" id={id} name={name} className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
};

export default Toggle;
