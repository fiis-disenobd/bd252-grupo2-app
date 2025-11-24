import React, { useState } from 'react';
import { GearsIcon, EditIcon, SortIcon, SearchIcon, PlusIcon, BackIcon, HomeIcon } from '../components/icons/IconsAlmacen';
import { Task } from '../types';
import TaskDetailModal from './TaskDetailModal';

interface TeamManagementProps {
    onBack: () => void;
    onHome: () => void;
    onAssign: (task: Task) => void;
    tasks: Task[];
}

const TeamManagement: React.FC<TeamManagementProps> = ({ onBack, onHome, onAssign, tasks }) => {
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

    const handleShowDetails = (task: Task) => {
        setSelectedTaskForDetail(task);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTaskForDetail(null);
    };

    return (
        <>
            <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg">
                <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <button className="p-3 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                             <GearsIcon className="w-8 h-8 text-blue-600" />
                        </button>
                        <button className="p-3 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                            <EditIcon className="w-8 h-8 text-blue-600" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800 ml-2">Gestión de Equipo y Tareas</h1>
                    </div>
                    <div className="flex items-center gap-4">
                       <button 
                            onClick={onBack} 
                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            aria-label="Go back to previous page"
                       >
                           <BackIcon className="w-5 h-5" />
                           <span>Volver</span>
                       </button>
                       <button 
                            onClick={onHome} 
                            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            aria-label="Go to home screen"
                       >
                           <HomeIcon className="w-5 h-5" />
                           <span>Home</span>
                       </button>
                    </div>
                </header>

                <div className="flex flex-wrap items-center justify-end mb-6 gap-4">
                    <div className="relative">
                        <input type="text" placeholder="" className="border border-gray-400 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                     <button className="bg-[#263238] hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md flex items-center transition-colors">
                        <span>Registrar</span>
                        <span className="ml-3 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center">
                            <PlusIcon className="w-4 h-4" />
                        </span>
                    </button>
                </div>

                {/* Tasks Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 border-collapse">
                        <thead className="text-xs text-white uppercase bg-[#1E3A8A]">
                            <tr>
                                {['ID RESERVA', 'TIPO_RESERVA', 'Fecha', 'Hora', 'Instalacion', 'Estado', 'Consulta', 'Asignación'].map(header => (
                                    <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                        <div className="flex items-center justify-between">
                                            <span>{header}</span>
                                            {header !== 'Consulta' && header !== 'Asignación' && <SortIcon className="w-4 h-4" />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 border border-gray-300">{task.id}</td>
                                    <td className="px-4 py-2 border border-gray-300">{task.tipo_reserva}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{task.date}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{task.time}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{task.instalacion || 'N/A'}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        {task.status}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        <button 
                                            onClick={() => handleShowDetails(task)}
                                            className="bg-[#1976D2] hover:bg-blue-700 text-white font-bold py-1 px-5 rounded-full text-xs transition-colors">VER</button>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        <button 
                                            onClick={() => onAssign(task)} 
                                            disabled={task.status !== 'Pendiente'}
                                            className={`font-bold py-1 px-5 rounded-full text-xs transition-colors ${
                                                task.status !== 'Pendiente' 
                                                ? 'bg-gray-400 text-gray-800 cursor-not-allowed' 
                                                : 'bg-[#1976D2] hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {task.status === 'Pendiente' ? 'ASIGNAR' : 'ASIGNADO'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            {isDetailModalOpen && selectedTaskForDetail && (
                <TaskDetailModal 
                    task={selectedTaskForDetail}
                    onClose={handleCloseDetailModal}
                />
            )}
        </>
    );
};

export default TeamManagement;