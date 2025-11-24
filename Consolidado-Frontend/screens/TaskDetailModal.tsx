import React, { useMemo } from 'react';
import { Task } from '../types';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
    
    const consolidatedPickingList = useMemo(() => {
        if (task.tipo_reserva !== 'Picking' || !task.orders) return [];
        
        const productMap = new Map<string, { name: string; quantity: number; unit: string; }>();
        
        task.orders.forEach(order => {
            // CORRECCIÓN AQUÍ: Usamos 'productsAlmacen' en lugar de 'products'
            // y agregamos '|| []' para evitar errores si viene vacío
            const listaProductos = order.productsAlmacen || [];

            listaProductos.forEach(product => {
                const existing = productMap.get(product.sku);
                if (existing) {
                    productMap.set(product.sku, { ...existing, quantity: existing.quantity + product.quantity });
                } else {
                    productMap.set(product.sku, { name: product.name, quantity: product.quantity, unit: product.unit });
                }
            });
        });
        
        return Array.from(productMap.entries());
    }, [task]);

    const renderContent = () => {
        switch (task.tipo_reserva) {
            case 'Recepción':
                return (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600 border-collapse">
                                <thead className="text-xs text-white uppercase bg-[#4A5568]">
                                    <tr>
                                        <th className="px-4 py-3 border border-gray-300">Cod. Producto</th>
                                        <th className="px-4 py-3 border border-gray-300">Nombre Producto</th>
                                        <th className="px-4 py-3 border border-gray-300 text-center">Cantidad</th>
                                        <th className="px-4 py-3 border border-gray-300 text-center">Unidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {task.products && task.products.length > 0 ? (
                                        task.products.map((product, index) => (
                                            // Usamos un key compuesto o index si no hay ID único garantizado
                                            <tr key={product.id || index} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 border border-gray-300">{product.id}</td>
                                                <td className="px-4 py-2 border border-gray-300">{product.name}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-center">{product.expectedQuantity}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-center">{product.unit}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4 px-4 border border-gray-300">No hay productos para esta recepción.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {(task.conductor || task.placa) && (
                            <div className="mt-4 pt-4 border-t text-gray-800">
                                {task.conductor && <p><span className="font-semibold">Conductor:</span> {task.conductor}</p>}
                                {task.placa && <p><span className="font-semibold">Placa:</span> {task.placa}</p>}
                            </div>
                        )}
                    </>
                );
            case 'Picking':
                 return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600 border-collapse">
                            <thead className="text-xs text-white uppercase bg-[#4A5568]">
                                <tr>
                                    <th className="px-4 py-3 border border-gray-300">Cod. Producto</th>
                                    <th className="px-4 py-3 border border-gray-300">Nombre Producto</th>
                                    <th className="px-4 py-3 border border-gray-300 text-center">Cantidad Total</th>
                                    <th className="px-4 py-3 border border-gray-300 text-center">Unidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                 {consolidatedPickingList.length > 0 ? (
                                    consolidatedPickingList.map(([sku, product]) => (
                                        <tr key={sku} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 border border-gray-300">{sku}</td>
                                            <td className="px-4 py-2 border border-gray-300">{product.name}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{product.quantity}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{product.unit}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 px-4 border border-gray-300">No hay productos para este despacho.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return <p className="text-gray-600">No hay detalles de productos para este tipo de reserva.</p>;
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Detalle de Reserva: {task.id}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        aria-label="Cerrar modal"
                    >&times;</button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {renderContent()}
                </main>
                <footer className="flex justify-end p-4 bg-gray-50 border-t">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TaskDetailModal;