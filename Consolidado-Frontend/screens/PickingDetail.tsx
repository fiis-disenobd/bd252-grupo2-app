import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { BackIcon, HomeIcon, PickingIcon } from '../components/icons/IconsAlmacen';

interface PickingDetailProps {
    task: Task | null;
    onBack: () => void;
    onHome: () => void;
    onFinishPicking: (pickedProducts: Map<string, number>) => void;
}

const PickingDetail: React.FC<PickingDetailProps> = ({ task, onBack, onHome, onFinishPicking }) => {
    
    // 2. ESCUDO DE SEGURIDAD: Si task es null, mostramos algo seguro en vez de pantalla blanca
    if (!task) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="p-6 bg-white rounded shadow-md text-center">
                    <p className="text-red-500 font-bold mb-4">Cargando datos de la tarea...</p>
                    <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    // State to track checked items. Key is `orderId-productSku`.
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    // 3. ACCESO SEGURO: Usamos '|| []' por si task.orders viene undefined
    const orders = task.orders || [];

    // Memoize consolidated list calculation
    const consolidatedList = useMemo(() => {
        const productMap = new Map<string, { name: string; quantity: number; unit: string; location?: string }>();
        orders.forEach(order => {
            order.productsAlmacen.forEach(product => { // OJO: Asegúrate si usas 'products' o 'productsAlmacen' según tu types.ts
                const existing = productMap.get(product.sku);
                if (existing) {
                    productMap.set(product.sku, { ...existing, quantity: existing.quantity + product.quantity });
                } else {
                    productMap.set(product.sku, { name: product.name, quantity: product.quantity, unit: product.unit, location: product.location });
                }
            });
        });
        return Array.from(productMap.entries());
    }, [orders]);

    const totalItemsToPick = useMemo(() => {
        // Ajuste: Dependiendo de tu estructura, asegúrate de usar la propiedad correcta (products o productsAlmacen)
        return orders.reduce((sum, order) => sum + (order.productsAlmacen ? order.productsAlmacen.length : 0), 0);
    }, [orders]);

    const handleCheckboxChange = (orderId: string, productSku: string) => {
        const key = `${orderId}-${productSku}`;
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleFinish = () => {
        // This map will hold the total quantity for each unique SKU across all orders.
        const pickedQuantities = new Map<string, number>();
        orders.forEach(order => {
            // Ajuste aquí también para usar productsAlmacen si es lo que definiste en tus datos
            const listaProductos = order.productsAlmacen || []; 
            listaProductos.forEach(product => {
                const currentQuantity = pickedQuantities.get(product.sku) || 0;
                pickedQuantities.set(product.sku, currentQuantity + product.quantity);
            });
        });
        onFinishPicking(pickedQuantities);
    };

    const allItemsChecked = checkedItems.size === totalItemsToPick && totalItemsToPick > 0;

    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg font-sans min-h-screen">
            <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-sky-100 rounded-md">
                        <PickingIcon className="w-8 h-8 text-sky-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Procesando Picking: Reserva {task.id}</h1>
                 </div>
                <div className="flex items-center gap-4">
                   <button 
                        onClick={onBack} 
                        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                   >
                        <BackIcon className="w-5 h-5" />
                        <span>Volver</span>
                   </button>
                   <button 
                        onClick={onHome} 
                        className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                   >
                        <HomeIcon className="w-5 h-5" />
                        <span>Home</span>
                   </button>
                </div>
            </header>
            
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                 <h2 className="text-xl font-bold text-gray-700 mb-4">Consolidado de Productos</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 text-left">Código</th>
                                <th className="px-4 py-2 text-left">Producto</th>
                                <th className="px-4 py-2 text-center">Ubicación</th>
                                <th className="px-4 py-2 text-center">Cantidad Total</th>
                                <th className="px-4 py-2 text-center">Unidad</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                           {consolidatedList.map(([sku, { name, quantity, unit, location }]) => (
                                <tr key={sku} className="border-b">
                                   <td className="px-4 py-2 font-mono text-gray-600">{sku}</td>
                                   <td className="px-4 py-2 text-gray-800">{name}</td>
                                   <td className="px-4 py-2 text-center font-semibold text-gray-700">{location || 'N/A'}</td>
                                   <td className="px-4 py-2 text-center font-bold text-lg text-sky-700">{quantity}</td>
                                   <td className="px-4 py-2 text-center text-gray-600">{unit}</td>
                                </tr>
                           ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="p-4 border border-blue-200 rounded-lg shadow-sm bg-white">
                        <h3 className="text-lg font-bold text-blue-800 mb-3">Pedido: {order.id}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-700 uppercase bg-blue-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Código</th>
                                        <th className="px-4 py-2 text-left">Producto</th>
                                        <th className="px-4 py-2 text-center">Ubicación</th>
                                        <th className="px-4 py-2 text-center">Cantidad</th>
                                        <th className="px-4 py-2 text-center">Alistado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.productsAlmacen || []).map(product => (
                                        <tr key={product.sku} className="border-b hover:bg-blue-50/50">
                                            <td className="px-4 py-3 font-mono text-gray-600">{product.sku}</td>
                                            <td className="px-4 py-3 text-gray-800">{product.name}</td>
                                            <td className="px-4 py-3 text-center font-semibold text-gray-700">{product.location || 'N/A'}</td>
                                            <td className="px-4 py-3 text-center font-semibold text-gray-800">{product.quantity}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                                    checked={checkedItems.has(`${order.id}-${product.sku}`)}
                                                    onChange={() => handleCheckboxChange(order.id, product.sku)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end mt-8">
                <button
                    onClick={handleFinish}
                    disabled={!allItemsChecked}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-md transition-colors shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Finalizar Picking
                </button>
            </div>
        </div>
    );
};

export default PickingDetail;