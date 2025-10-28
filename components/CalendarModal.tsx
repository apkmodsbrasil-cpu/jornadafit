
import React, { useState } from 'react';
import type { Workout } from '../types.ts';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  workouts: Workout[];
  currentDate: Date;
  completionHistory?: { [date: string]: string };
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onDateSelect, workouts, currentDate, completionHistory }) => {
  const [displayDate, setDisplayDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const weekDaysMap: Record<string, number> = { 'Domingo': 0, 'Segunda-feira': 1, 'Terça-feira': 2, 'Quarta-feira': 3, 'Quinta-feira': 4, 'Sexta-feira': 5, 'Sábado': 6 };
  const workoutDays = new Set(workouts.map(w => weekDaysMap[w.day]));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const renderDays = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-center"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const isSelected = date.toDateString() === currentDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < today;

      const hasWorkout = workoutDays.has(date.getDay());
      const dateKey = date.toISOString().split('T')[0];
      
      const isCompleted = !!(completionHistory && completionHistory[dateKey]);
      const isMissed = isPast && hasWorkout && !isCompleted;

      const dayClasses = `
        w-9 h-9 flex items-center justify-center text-center rounded-full cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
        ${!isSelected && isToday ? 'bg-gray-600 text-white' : ''}
        ${!isSelected && !isToday ? 'hover:bg-gray-700' : ''}
      `;
      
      let dot = null;
      if (isCompleted) {
        dot = <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-green-400 rounded-full"></div>;
      } else if (isMissed) {
        dot = <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>;
      } else if (hasWorkout) {
        dot = <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>;
      }

      days.push(
        <div key={day} className="relative flex justify-center items-center" onClick={() => onDateSelect(date)}>
          <div className={dayClasses}>
            {day}
          </div>
          {dot}
        </div>
      );
    }
    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-xs border border-gray-700 p-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-lg capitalize">
            {displayDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {renderDays()}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-300">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Concluído</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Não foi</span>
            </div>
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>A treinar</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Descanso</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;