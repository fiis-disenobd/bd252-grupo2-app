import React, { useState } from 'react';
import { SortIcon, SearchIcon, BackIcon, HomeIcon, PlusIcon } from '../components/icons/IconsAlmacen';
import { Operator } from '../types';

interface OperatorManagementProps {
    operators: Operator[];
    onAddOperator: (operator: Operator) => void;
    onBack: () => void;
    onHome: () => void;
}

const OperatorManagement: React.FC<OperatorManagementProps> = ({ operators, onAddOperator, onBack, onHome }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State
    const [newOperator, setNewOperator] = useState<Operator>({
        id: '',
        name: '',
        dni: '',
        phone: '',
        status: 'Disponible'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewOperator(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOperator.id && newOperator.name && newOperator.dni && newOperator.phone) {
            onAddOperator(newOperator);
            setIsModalOpen(false);
            // Reset form
            setNewOperator({
                id: '',
                name: '',
                dni: '',
                phone: '',
                status: 'Disponible'
            });
        } else {
            alert("Por favor complete todos los campos obligatorios");
        }
    };

    const filteredOperators = operators.filter(op => 
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg relative">
            <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                 <h1 className="text-3xl font-bold text-gray-800">Operadores</h1>
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

            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
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
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#263238] hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md flex items-center transition-colors shadow-md"
                >
                    <span>Registrar</span>
                    <span className="ml-3 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center">
                        <PlusIcon className="w-4 h-4" />
                    </span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                    <thead className="text-xs text-white uppercase bg-[#1E3A8A]">
                        <tr>
                            {['IdOperador', 'Nombre', 'DNI', 'Telefono', 'Estado'].map(header => (
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
                        {filteredOperators.map((op) => (
                            <tr key={op.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-2 border border-gray-300">{op.id}</td>
                                <td className="px-4 py-2 border border-gray-300">{op.name}</td>
                                <td className="px-4 py-2 border border-gray-300">{op.dni}</td>
                                <td className="px-4 py-2 border border-gray-300">{op.phone}</td>
                                <td className="px-4 py-2 border border-gray-300">{op.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Register Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Añadir Nuevo Empleado</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id">
                                    Código
                                </label>
                                <input
                                    type="text"
                                    id="id"
                                    name="id"
                                    value={newOperator.id}
                                    onChange={handleInputChange}
                                    placeholder="Ej: EMP006"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newOperator.name}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="w-1/2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dni">
                                        DNI
                                    </label>
                                    <input
                                        type="text"
                                        id="dni"
                                        name="dni"
                                        value={newOperator.dni}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={newOperator.phone}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                                    Estado
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={newOperator.status}
                                    onChange={handleInputChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 bg-white"
                                >
                                    <option value="Disponible">Disponible</option>
                                    <option value="Ocupado">Ocupado</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-4 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperatorManagement;