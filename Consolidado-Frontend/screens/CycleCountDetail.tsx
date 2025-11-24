
import React, { useState } from 'react';
import { Task, InventoryProduct, ProductAlmacen, Incident } from '../types';
import { BackIcon, HomeIcon, CycleCountIcon, IncidentIcon } from '../components/icons/IconsAlmacen';
import IncidentReportModal from './IncidentReportModal';

interface CycleCountDetailProps {
    task: Task;
    inventory: InventoryProduct[];
    onBack: () => void;
    onHome: () => void;
    onFinishCount: (countedQuantities: Map<string, number>) => void;
}

const CycleCountDetail: React.FC<CycleCountDetailProps> = ({ task, inventory, onBack, onHome, onFinishCount }) => {
    const [countedQuantities, setCountedQuantities] = useState<Record<string, number>>(() => {
        const initialState: Record<string, number> = {};
        inventory.forEach(p => {
            initialState[p.sku] = 0;
        });
        return initialState;
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductForIncident, setSelectedProductForIncident] = useState<InventoryProduct | null>(null);

    const handleQuantityChange = (productSku: string, value: string) => {
        const quantity = parseInt(value, 10);
        setCountedQuantities(prev => ({
            ...prev,
            [productSku]: isNaN(quantity) ? 0 : quantity,
        }));
    };

    const handleOpenIncidentModal = (product: InventoryProduct) => {
        setSelectedProductForIncident(product);
        setIsModalOpen(true);
    };

    const handleCloseIncidentModal = () => {
        setIsModalOpen(false);
        setSelectedProductForIncident(null);
    };

    const handleSubmitIncidents = (productSku: string, incidents: Incident[]) => {
        console.log(`Incidents for product ${productSku}:`, incidents);
        // Here you would typically update the state or send data to an API
        handleCloseIncidentModal();
    };

    const handleFinishCount = () => {
        const countedQuantitiesMap = new Map<string, number>();
        for (const sku in countedQuantities) {
            countedQuantitiesMap.set(sku, countedQuantities[sku]);
        }
        onFinishCount(countedQuantitiesMap);
        onBack();
    };
    
    const convertToProductForModal = (invProduct: InventoryProduct | null): ProductAlmacen | null => {
        if (!invProduct) return null;
        return {
            id: invProduct.sku,
            name: invProduct.name,
            expectedQuantity: invProduct.physicalStock,
            unit: invProduct.unit
        };
    };

    return (
        <>
            <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg">
                <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                     <div className="flex items-center space-x-4">
                        <div className="p-3 bg-sky-100 rounded-md">
                            <CycleCountIcon className="w-8 h-8 text-sky-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Detalle de Conteo: {task.id}</h1>
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
                                {['Código', 'Nombre', 'Unidad', 'Ubicación', 'Cantidad en Stock', 'Cantidad Contada', 'Acción'].map(header => (
                                    <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {inventory && inventory.length > 0 ? (
                                inventory.map((product) => (
                                    <tr key={product.sku} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 border border-gray-300">{product.sku}</td>
                                        <td className="px-4 py-2 border border-gray-300">{product.name}</td>
                                        <td className="px-4 py-2 border border-gray-300">{product.unit}</td>
                                        <td className="px-4 py-2 border border-gray-300">{product.location}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{product.physicalStock}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            <input 
                                                type="number"
                                                value={countedQuantities[product.sku]}
                                                onChange={(e) => handleQuantityChange(product.sku, e.target.value)}
                                                className="w-20 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-gray-900"
                                                aria-label={`Cantidad contada para ${product.name}`}
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            <button 
                                                onClick={() => handleOpenIncidentModal(product)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors flex items-center justify-center gap-1 mx-auto"
                                            >
                                                <IncidentIcon className="w-3 h-3" />
                                                <span>Reportar Incidencia</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 px-4 border border-gray-300">No hay productos en el inventario para contar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-8">
                    <button 
                        onClick={handleFinishCount}
                        className="bg-[#1976D2] hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        Finalizar Conteo
                    </button>
                </div>
            </div>

            {isModalOpen && selectedProductForIncident && (
                <IncidentReportModal 
                    product={convertToProductForModal(selectedProductForIncident)!}
                    onClose={handleCloseIncidentModal}
                    onSubmit={(incidents) => handleSubmitIncidents(selectedProductForIncident.sku, incidents)}
                />
            )}
        </>
    );
};

export default CycleCountDetail;
