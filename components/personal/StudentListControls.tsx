import React from 'react';

type StatusFilter = 'all' | 'pending_review' | 'active' | 'inactive' | 'pending_creation';
type SortBy = 'priority' | 'name_asc' | 'name_desc';

interface StudentListControlsProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: StatusFilter;
    setStatusFilter: (value: StatusFilter) => void;
    sortBy: SortBy;
    setSortBy: (value: SortBy) => void;
}

const filterOptions: { value: StatusFilter, label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending_review', label: 'Para Revisar' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' },
    { value: 'pending_creation', label: 'Sem Plano' }
];

const StudentListControls: React.FC<StudentListControlsProps> = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, sortBy, setSortBy }) => {
    return (
        <div className="mb-4 p-3 bg-gray-900/40 border border-gray-700/50 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div className="flex-shrink-0">
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="w-full md:w-auto bg-gray-800 text-white p-2 rounded-lg border border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="priority">Ordenar por Prioridade</option>
                        <option value="name_asc">Nome (A-Z)</option>
                        <option value="name_desc">Nome (Z-A)</option>
                    </select>
                </div>
            </div>
            <div className="no-scrollbar overflow-x-auto">
                <div className="flex items-center gap-2 pb-1">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            className={`px-4 py-1.5 text-sm whitespace-nowrap rounded-full border transition-colors ${
                                statusFilter === opt.value
                                    ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentListControls;