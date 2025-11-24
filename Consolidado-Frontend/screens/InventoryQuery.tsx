
import React, { useState } from 'react';
import { BackIcon, HomeIcon, SearchIcon } from '../components/icons/IconsAlmacen';
import { InventoryProduct } from '../types';

interface InventoryQueryProps {
    onBack: () => void;
    onHome: () => void;
    inventoryData: InventoryProduct[];
}

const InventoryQuery: React.FC<InventoryQueryProps> = ({ onBack, onHome, inventoryData }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = inventoryData.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg font-sans">
            <header className="flex items-start justify-between mb-2 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Consulta de Inventario</h1>
                    <p className="text-gray-600 mt-1">Seleccionar Orden de Compra Prentinto</p>
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

            <div className="flex justify-start my-6">
                 <div className="relative w-full max-w-sm">
                    <input 
                        type="text" 
                        placeholder="Buscar por Nombre, RUC o Nombre Proveedor..." 
                        className="border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute inset-y-0 right-0 flex items-center justify-center px-3 bg-blue-600 hover:bg-blue-700 rounded-r-md">
                        <SearchIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700 border-collapse">
                    <thead className="text-xs text-gray-800 uppercase bg-[#DDEBF7]">
                        <tr>
                            {['Código', 'Producto', 'Ubicación', 'Unidad', 'Stock Físico', 'Stock Comprometido', 'Stock Disponible', 'Stock Mínimo', 'Stock Máximo', 'Stock Cuarentena'].map(header => (
                                <th key={header} scope="col" className="px-4 py-3 font-bold">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.sku} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{item.sku}</td>
                                <td className="px-4 py-3">{item.name}</td>
                                <td className="px-4 py-3">{item.location}</td>
                                <td className="px-4 py-3 text-center">{item.unit}</td>
                                <td className="px-4 py-3 text-center">{item.physicalStock}</td>
                                <td className="px-4 py-3 text-center">{item.committedStock}</td>
                                <td className="px-4 py-3 text-center font-semibold">{item.availableStock}</td>
                                <td className="px-4 py-3 text-center">{item.minStock}</td>
                                <td className="px-4 py-3 text-center">{item.maxStock}</td>
                                <td className="px-4 py-3 text-center font-semibold text-orange-600">{item.quarantineStock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredData.length === 0 && (
                    <div className="text-center py-8 bg-white border-b">
                        <p className="text-gray-500">No se encontraron productos que coincidan con la búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryQuery;
