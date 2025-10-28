import React, { useState, useMemo, useEffect } from 'react';
import type { Student } from '../../types.ts';
import PlusCircleIcon from '../icons/PlusCircleIcon.tsx';
import StudentListControls from './StudentListControls.tsx';
import Pagination from '../shared/Pagination.tsx';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddNewStudent: () => void;
}

const ITEMS_PER_PAGE = 10;

const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent, onAddNewStudent }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'active' | 'inactive' | 'pending_creation'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'name_asc' | 'name_desc'>('priority');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  const processedStudents = useMemo(() => {
    const getPriorityScore = (student: Student) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const expiryDate = student.planExpiryDate ? new Date(student.planExpiryDate) : null;
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        if (student.planStatus === 'pending_review') return 6;
        if (expiryDate && expiryDate < today) return 5;
        if (student.planStatus === 'pending_creation') return 4;
        if (expiryDate && expiryDate < sevenDaysFromNow) return 3;
        if (student.aiInsights?.some(i => i.type === 'warning')) return 2;
        if (student.aiInsights?.some(i => i.type === 'suggestion')) return 1;
        if (student.planStatus === 'inactive') return -1;
        return 0;
    };

    return students
      .filter(student => 
        (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'all' || student.planStatus === statusFilter)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'priority': return getPriorityScore(b) - getPriorityScore(a) || (a.name || '').localeCompare(b.name || '');
          case 'name_asc': return (a.name || '').localeCompare(b.name || '');
          case 'name_desc': return (b.name || '').localeCompare(a.name || '');
          default: return 0;
        }
      });
  }, [students, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(processedStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedStudents, currentPage]);

  const getStatusBadge = (student: Student) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = student.planExpiryDate ? new Date(student.planExpiryDate) : null;
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      if (student.planStatus === 'pending_review') return <span className="text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">Para Revisar</span>;
      if (student.planStatus === 'inactive') return <span className="text-xs font-bold text-gray-400 bg-gray-700 px-2 py-1 rounded-full">Inativo</span>;
      if (expiryDate && expiryDate < today) return <span className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Vencido</span>;
      if (expiryDate && expiryDate < sevenDaysFromNow) return <span className="text-xs font-bold text-yellow-500 bg-yellow-900/40 px-2 py-1 rounded-full">Vence Logo</span>;
      if (student.aiInsights?.some(i => i.type === 'warning')) return <span className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Alerta IA</span>;
      return null;
  };

  return (
    <>
      <StudentListControls 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sortBy={sortBy} setSortBy={setSortBy}
      />
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg">
        <ul className="divide-y divide-gray-700/50">
          {paginatedStudents.map(student => (
            <li key={student.id} onClick={() => onSelectStudent(student)} className="p-4 flex justify-between items-center hover:bg-gray-700/50 cursor-pointer transition-colors">
              <div>
                <p className="font-semibold text-white">{student.name}</p>
                <p className="text-sm text-gray-400">{student.goal || 'Anamnese pendente'}</p>
              </div>
              {getStatusBadge(student)}
            </li>
          ))}
          {processedStudents.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                  <p>{students.length > 0 ? "Nenhum aluno encontrado com os filtros atuais." : "Nenhum aluno cadastrado ainda."}</p>
              </div>
          )}
        </ul>
        {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
      <div className="mt-4">
        <button onClick={onAddNewStudent} className="w-full flex items-center justify-center p-2 text-sm text-blue-400 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Adicionar Novo Aluno
        </button>
      </div>
    </>
  );
};

export default StudentList;
