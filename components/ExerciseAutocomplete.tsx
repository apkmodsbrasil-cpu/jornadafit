import React, { useState, useEffect, useRef } from 'react';
import type { ExerciseDetails } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface ExerciseAutocompleteProps {
  value: string; // The selected exerciseId
  onChange: (newValue: string) => void;
  exerciseDatabase: Record<string, ExerciseDetails>;
  onAddNewExercise: (exerciseName: string) => Promise<string | null>;
  isCreating: boolean;
}

const ExerciseAutocomplete: React.FC<ExerciseAutocompleteProps> = ({ value, onChange, exerciseDatabase, onAddNewExercise, isCreating }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<[string, ExerciseDetails][]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const exerciseName = exerciseDatabase[value]?.name || '';
    if (document.activeElement !== wrapperRef.current?.querySelector('input')) {
        setQuery(exerciseName);
    }
  }, [value, exerciseDatabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        const currentExerciseName = exerciseDatabase[value]?.name || '';
        if (query !== currentExerciseName) {
            setQuery(currentExerciseName);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef, query, value, exerciseDatabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 1) {
      // FIX: Cast Object.entries to the correct type to allow proper type inference within the filter.
      const filtered = (Object.entries(exerciseDatabase) as [string, ExerciseDetails][]).filter(([id, details]) =>
        details.name.toLowerCase().includes(newQuery.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setQuery(exerciseDatabase[id].name);
    setIsFocused(false);
  };
  
  const handleAddNew = async () => {
    if(!query.trim() || isCreating) return;
    const newId = await onAddNewExercise(query);
    if(newId) {
       // The parent component will handle the onChange call through its state update logic.
       // We just need to close the suggestions.
       setIsFocused(false);
    }
  };
  
  const showSuggestions = isFocused && query.length > 1;
  const exactMatch = suggestions.some(([id, details]) => details.name.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Digite o nome do exercício..."
          className="w-full bg-gray-700 p-2 rounded-md text-sm pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isCreating}
          autoComplete="off"
        />
        {isCreating && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
      </div>

      {showSuggestions && !isCreating && (
        <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul>
            {suggestions.map(([id, details]) => (
              <li
                key={id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(id); }}
                className="px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
              >
                {details.name}
              </li>
            ))}
             {!exactMatch && query.length > 2 && (
              <li
                onMouseDown={(e) => { e.preventDefault(); handleAddNew(); }}
                className="px-3 py-2 text-sm text-green-400 hover:bg-gray-700 cursor-pointer font-semibold"
              >
                + Adicionar novo: "{query}"
              </li>
            )}
            {suggestions.length === 0 && query.length > 2 && (
                 <li
                    onMouseDown={(e) => { e.preventDefault(); handleAddNew(); }}
                    className="px-3 py-2 text-sm text-green-400 hover:bg-gray-700 cursor-pointer font-semibold"
                  >
                    + Adicionar novo: "{query}"
                  </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExerciseAutocomplete;
