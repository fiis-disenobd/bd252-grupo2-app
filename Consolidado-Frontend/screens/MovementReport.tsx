import React, { useState } from 'react';
import { BackIcon, HomeIcon, SearchIcon, MovementReportIcon } from '../components/icons/IconsAlmacen';
import { MOVEMENT_DATA } from '../constants';
import { Movement } from '../types';

interface MovementReportProps {
    onBack: () => void;
    onHome: () => void;
}

const MovementReport: React.FC<MovementReportProps> = ({ onBack, onHome }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = MOVEMENT_DATA.filter(movement =>
        movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.productSku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg font-sans">
            <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-sky-100 rounded-md">
                        <MovementReportIcon className="w-8 h-8 text-sky-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Reporte de Movimientos</h1>
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
            
            <div className="my-6">
                <label htmlFor="product-search" className="block text-lg font-medium text-gray-700 mb-2">
                    Buscar producto
                </label>
                <div className="relative w-full max-w-md">
                    <input 
                        id="product-search"
                        type="text" 
                        placeholder="Buscar por Nombre o Código..." 
                        className="border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        className="absolute inset-y-0 right-0 flex items-center justify-center px-4 bg-blue-600 hover:bg-blue-700 rounded-r-md transition-colors"
                    >
                        <SearchIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto mt-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Últimos Movimientos</h2>
                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                    <thead className="text-xs text-white uppercase bg-[#1E3A8A]">
                        <tr>
                            {['ID', 'FECHA Y HORA', 'TIPO MOVIMIENTO', 'PRODUCTO', 'UBICACIÓN', 'CANTIDAD', 'DETALLE'].map(header => (
                                <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((movement) => (
                                <tr key={movement.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 border border-gray-300 font-mono text-xs">{movement.id}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{movement.date}</span>
                                            <span className="text-xs text-gray-500">{movement.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            movement.type === 'Entrada' ? 'bg-green-100 text-green-800' :
                                            movement.type === 'Salida' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {movement.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300">
                                        <div>
                                            <p className="font-semibold">{movement.productName}</p>
                                            <p className="text-xs text-gray-500">{movement.productSku}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{movement.location}</td>
                                    <td className={`px-4 py-2 border border-gray-300 font-bold text-center ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 font-mono text-xs">{movement.origin}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-4 px-4 border border-gray-300">No se encontraron movimientos.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MovementReport;