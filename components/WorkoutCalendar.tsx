
import React, { useState } from 'react';
import type { Workout } from '../types.ts';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import CalendarIcon from './icons/CalendarIcon.tsx';
import CalendarModal from './CalendarModal.tsx';

interface WorkoutCalendarProps {
  workouts: Workout[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  completionHistory?: { [date: string]: string };
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workouts, currentDate, onDateChange, completionHistory }) => {
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setCalendarOpen(false);
  };

  const formatDate = (date: Date) => {
    const day = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dayOfMonth = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `${day}, ${dayOfMonth} ${month}`;
  };

  return (
    <>
      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-700/60 transition-colors">
          <ChevronLeftIcon className="w-8 h-8 text-blue-400" />
        </button>
        <button 
          onClick={() => setCalendarOpen(true)}
          className="text-lg md:text-xl font-bold text-center w-52 md:w-64 py-2 px-4 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center justify-center space-x-2"
        >
          <CalendarIcon className="w-5 h-5 mr-2 opacity-70 flex-shrink-0" />
          <span className="capitalize">{formatDate(currentDate)}</span>
        </button>
        <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-gray-700/60 transition-colors">
          <ChevronRightIcon className="w-8 h-8 text-blue-400" />
        </button>
      </div>
      
      {isCalendarOpen && (
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setCalendarOpen(false)}
          onDateSelect={handleDateSelect}
          workouts={workouts}
          currentDate={currentDate}
          completionHistory={completionHistory}
        />
      )}
    </>
  );
};

export default WorkoutCalendar;