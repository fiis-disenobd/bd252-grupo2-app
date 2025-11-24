
import React, { useState } from 'react';
import { BackIcon, HomeIcon, SearchIcon, IncidentIcon} from '../components/icons/IconsAlmacen';
import {INCIDENTS_DATA, INCIDENT_TYPES} from '../constants';
import { IncidentLog, IncidentType } from '../types';

interface IncidentsReportProps {
    onBack: () => void;
    onHome: () => void;
}

const IncidentsReport: React.FC<IncidentsReportProps> = ({ onBack, onHome }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<IncidentType | 'Todos'>('Todos');

    // Filter logic that runs on render based on state
    const filteredData = INCIDENTS_DATA.filter(incident => {
        const matchesSearch = searchTerm.trim() === '' || 
            incident.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.productSku.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'Todos' || incident.type === filterType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg font-sans">
            <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-md">
                        <IncidentIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Reporte de Incidencias</h1>
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
            
            <div className="my-6 flex flex-wrap items-end gap-4">
                <div className="flex-grow max-w-md">
                    <label htmlFor="product-search" className="block text-lg font-medium text-gray-700 mb-2">
                        Buscar producto
                    </label>
                    <div className="relative w-full">
                        <input 
                            id="product-search"
                            type="text" 
                            placeholder="Buscar por Nombre o Código..." 
                            className="border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="type-filter" className="block text-lg font-medium text-gray-700 mb-2">
                        Filtrar por tipo
                    </label>
                    <select
                        id="type-filter"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as IncidentType | 'Todos')}
                        className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="Todos">Todos</option>
                        {INCIDENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto mt-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Listado de Incidencias</h2>
                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                    <thead className="text-xs text-white uppercase bg-[#1E3A8A]">
                        <tr>
                            {['ID', 'FECHA', 'TIPO INCIDENCIA', 'PRODUCTO', 'CANTIDAD', 'DETALLE', 'ESTADO', 'ACCIÓN'].map(header => (
                                <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((incident) => (
                                <tr key={incident.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 border border-gray-300 font-medium">{incident.id}</td>
                                    <td className="px-4 py-2 border border-gray-300">{incident.date}</td>
                                    <td className="px-4 py-2 border border-gray-300">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${incident.type === 'Roto' ? 'bg-red-100 text-red-800' : 
                                              incident.type === 'Húmedo' ? 'bg-blue-100 text-blue-800' : 
                                              incident.type === 'Oxidado' ? 'bg-orange-100 text-orange-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {incident.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300">
                                        <div>
                                            <p className="font-semibold">{incident.productName}</p>
                                            <p className="text-xs text-gray-500">{incident.productSku}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 text-center font-bold text-red-600">
                                        {incident.quantity}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 font-mono text-xs">{incident.detailId}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            incident.status === 'Resuelto' ? 'bg-green-100 text-green-800' :
                                            incident.status === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-200 text-gray-800'
                                        }`}>
                                            {incident.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs underline">
                                            Gestionar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center py-4 px-4 border border-gray-300">No se encontraron incidencias para los criterios de búsqueda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncidentsReport;