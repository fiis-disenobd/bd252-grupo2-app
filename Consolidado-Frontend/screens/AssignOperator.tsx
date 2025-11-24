import React, { useState } from 'react';
import { GearsIcon, EditIcon, SortIcon, SearchIcon, BackIcon, HomeIcon } from '../components/icons/IconsAlmacen';
import { Task, Operator } from '../types';

interface AssignOperatorProps {
    task: Task;
    operators: Operator[];
    onBack: () => void;
    onHome: () => void;
    onAssignOperators: (taskId: string, operators: Operator[]) => void;
}

const AssignOperator: React.FC<AssignOperatorProps> = ({ task, operators, onBack, onHome, onAssignOperators }) => {
    const [selectedOperators, setSelectedOperators] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const handleCheckboxChange = (operatorId: string) => {
        setSelectedOperators(prev => {
            const newSet = new Set(prev);
            if (newSet.has(operatorId)) {
                newSet.delete(operatorId);
            } else {
                newSet.add(operatorId);
            }
            return newSet;
        });
    };

    const handleAssign = () => {
        const selectedOperatorObjects = operators.filter(op => selectedOperators.has(op.id));
        if (selectedOperatorObjects.length > 0) {
            onAssignOperators(task.id, selectedOperatorObjects);
            onBack(); // Go back after assigning
        } else {
            alert('Por favor, seleccione al menos un operador.');
        }
    };

    const filteredOperators = operators.filter(op => 
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg">
            <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                    <button className="p-3 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                        <GearsIcon className="w-8 h-8 text-blue-600" />
                    </button>
                    <button className="p-3 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                        <EditIcon className="w-8 h-8 text-blue-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 ml-2">Asignar Equipo a Reserva {task.id}</h1>
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

             {/* Selected Task Table */}
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                    <thead className="text-xs text-white uppercase bg-[#4A5568]">
                        <tr>
                            {['ID RESERVA', 'TIPO_RESERVA', 'Fecha', 'Hora', 'Instalacion', 'Estado'].map(header => (
                                <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                    <div className="flex items-center justify-between">
                                        <span>{header}</span>
                                        <SortIcon className="w-4 h-4" />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b">
                            <td className="px-4 py-2 border border-gray-300">{task.id}</td>
                            <td className="px-4 py-2 border border-gray-300">{task.tipo_reserva}</td>
                            <td className="px-4 py-2 border border-gray-300 text-center">{task.date}</td>
                            <td className="px-4 py-2 border border-gray-300 text-center">{task.time}</td>
                            <td className="px-4 py-2 border border-gray-300 text-center">{task.instalacion || 'N/A'}</td>
                            <td className="px-4 py-2 border border-gray-300 text-center">{task.status}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Operators Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Operadores Disponibles</h2>
                <div className="flex flex-wrap items-center justify-start mb-6 gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-400 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 border-collapse">
                        <thead className="text-xs text-white uppercase bg-[#1E3A8A]">
                            <tr>
                                {['IdOperador', 'Nombre', 'DNI', 'Telefono', 'Estado', 'ASIGNAR'].map(header => (
                                    <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                        <div className="flex items-center justify-between">
                                            <span>{header}</span>
                                            {header !== 'ASIGNAR' && <SortIcon className="w-4 h-4" />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOperators.map((op) => (
                                <tr key={op.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 border border-gray-300">{op.id}</td>
                                    <td className="px-4 py-2 border border-gray-300">{op.name}</td>
                                    <td className="px-4 py-2 border border-gray-300">{op.dni}</td>
                                    <td className="px-4 py-2 border border-gray-300">{op.phone}</td>
                                    <td className="px-4 py-2 border border-gray-300">{op.status}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            checked={selectedOperators.has(op.id)}
                                            onChange={() => handleCheckboxChange(op.id)}
                                            aria-label={`Asignar a ${op.name}`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-8">
                    <button 
                        onClick={handleAssign}
                        className="bg-[#1976D2] hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignOperator;