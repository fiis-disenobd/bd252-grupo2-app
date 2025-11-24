
import React, { useState } from 'react';
import { Task, ProductAlmacen, Incident } from '../types';
import { BackIcon, HomeIcon, ReceiveGoodsIcon, IncidentIcon } from '../components/icons/IconsAlmacen';
import IncidentReportModal from './IncidentReportModal';

interface ReceptionDetailProps {
    task: Task;
    onBack: () => void;
    onHome: () => void;
    onUpdateInventory: (receivedQuantities: Record<string, number>, products: ProductAlmacen[]) => void;
}

const ReceptionDetail: React.FC<ReceptionDetailProps> = ({ task, onBack, onHome, onUpdateInventory }) => {
    const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>(() => {
        const initialState: Record<string, number> = {};
        task.products?.forEach(p => {
            initialState[p.id] = 0;
        });
        return initialState;
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductForIncident, setSelectedProductForIncident] = useState<ProductAlmacen | null>(null);

    const handleQuantityChange = (productId: string, value: string) => {
        const quantity = parseInt(value, 10);
        setReceivedQuantities(prev => ({
            ...prev,
            [productId]: isNaN(quantity) ? 0 : quantity,
        }));
    };

    const handleOpenIncidentModal = (product: ProductAlmacen) => {
        setSelectedProductForIncident(product);
        setIsModalOpen(true);
    };

    const handleCloseIncidentModal = () => {
        setIsModalOpen(false);
        setSelectedProductForIncident(null);
    };

    const handleSubmitIncidents = (productId: string, incidents: Incident[]) => {
        console.log(`Incidents for product ${productId}:`, incidents);
        // Here you would typically update the state or send data to an API
        handleCloseIncidentModal();
    };

    const handleFinishReception = () => {
        if (task.products) {
            onUpdateInventory(receivedQuantities, task.products);
        }
        onBack(); // Navigate back after finishing
    };
    
    return (
        <>
            <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg">
                <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                     <div className="flex items-center space-x-4">
                        <div className="p-3 bg-sky-100 rounded-md">
                            <ReceiveGoodsIcon className="w-8 h-8 text-sky-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Detalle de Recepción: {task.id}</h1>
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
                                {['ID Producto', 'Nombre', 'Unidad', 'Cantidad Esperada', 'Cantidad Recibida', 'Acción'].map(header => (
                                    <th key={header} scope="col" className="px-4 py-3 border border-gray-300">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {task.products && task.products.length > 0 ? (
                                task.products.map((product) => (
                                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 border border-gray-300">{product.id}</td>
                                        <td className="px-4 py-2 border border-gray-300">{product.name}</td>
                                        <td className="px-4 py-2 border border-gray-300">{product.unit}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{product.expectedQuantity}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                            <input 
                                                type="number"
                                                value={receivedQuantities[product.id]}
                                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                className="w-20 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-gray-900"
                                                aria-label={`Cantidad recibida para ${product.name}`}
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
                                    <td colSpan={6} className="text-center py-4 px-4 border border-gray-300">No hay productos en esta tarea de recepción.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-8">
                    <button 
                        onClick={handleFinishReception}
                        className="bg-[#1976D2] hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        Finalizar Recepción
                    </button>
                </div>
            </div>

            {isModalOpen && selectedProductForIncident && (
                <IncidentReportModal 
                    product={selectedProductForIncident}
                    onClose={handleCloseIncidentModal}
                    onSubmit={(incidents) => handleSubmitIncidents(selectedProductForIncident.id, incidents)}
                />
            )}
        </>
    );
};

export default ReceptionDetail;
