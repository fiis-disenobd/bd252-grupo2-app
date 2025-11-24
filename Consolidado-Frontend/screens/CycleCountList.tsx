import React, { useState } from 'react';
import { BackIcon, HomeIcon, CycleCountIcon } from '../components/icons/IconsAlmacen';
import { Task, Operator } from '../types';
import AssignedOperatorsModal from './AssignedOperatorsModal';

interface CycleCountListProps {
    onBack: () => void;
    onHome: () => void;
    onProcessCount: (task: Task) => void;
    tasks: Task[];
}

const CycleCountList: React.FC<CycleCountListProps> = ({ onBack, onHome, onProcessCount, tasks }) => {
    const [isOperatorsModalOpen, setIsOperatorsModalOpen] = useState(false);
    const [operatorsToShow, setOperatorsToShow] = useState<Operator[]>([]);

    const countTasks = tasks.filter(
        task => task.tipo_reserva === 'Conteo' && task.status === 'En Proceso'
    );

    const handleShowOperators = (operators: Operator[] | undefined) => {
        if (operators && operators.length > 0) {
            setOperatorsToShow(operators);
            setIsOperatorsModalOpen(true);
        }
    };

    return (
        <>
            <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg">
                <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                     <div className="flex items-center space-x-4">
                        <div className="p-3 bg-sky-100 rounded-md">
                            <CycleCountIcon className="w-8 h-8 text-sky-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Conteo Cíclico</h1>
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

                <div className="overflow-x-auto mt-8">
                    <table className="w-full text-sm text-left text-gray-600 border-collapse">
                        <thead className="text-xs text-white uppercase bg-[#1E3A8A]">
                            <tr>
                                {['ID RESERVA', 'TIPO_RESERVA', 'Fecha', 'Hora', 'Instalacion', 'Estado', 'Operadores Asignados', 'Acción'].map(header => (
                                    <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {countTasks.length > 0 ? (
                                countTasks.map((task) => (
                                    <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 border border-gray-300">{task.id}</td>
                                        <td className="px-4 py-2 border border-gray-300">{task.tipo_reserva}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{task.date}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{task.time}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{task.instalacion || 'N/A'}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{task.status}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            <button 
                                                onClick={() => handleShowOperators(task.assignedOperators)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-full text-xs transition-colors disabled:bg-gray-400"
                                                disabled={!task.assignedOperators || task.assignedOperators.length === 0}
                                            >
                                                Ver
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            <button 
                                                onClick={() => onProcessCount(task)}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded-full text-xs transition-colors"
                                            >
                                                Contar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 px-4 border border-gray-300">No hay tareas de conteo asignadas. Asigne una desde 'Gestionar Equipo y Tareas'.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isOperatorsModalOpen && (
                <AssignedOperatorsModal 
                    operators={operatorsToShow}
                    onClose={() => setIsOperatorsModalOpen(false)}
                />
            )}
        </>
    );
};

export default CycleCountList;