
import React, { useState } from 'react';
import { BackIcon, HomeIcon, SearchIcon, StockControlIcon } from '../components/icons/IconsAlmacen';
import { InventoryProduct } from '../types';
import RequestStockModal from './RequestStockModal';
import ResolveStockModal from './ResolveStockModal';

interface StockControlProps {
    onBack: () => void;
    onHome: () => void;
    inventoryData: InventoryProduct[];
    onUpdateStockLimits: (sku: string, newMinStock: number, newMaxStock: number) => void;
    onResolveStock: (sku: string, returnQty: number, discardQty: number) => void;
}

const StockControl: React.FC<StockControlProps> = ({ onBack, onHome, inventoryData, onUpdateStockLimits, onResolveStock }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Request Stock Modal State
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedProductForRequest, setSelectedProductForRequest] = useState<InventoryProduct | null>(null);
    const [currentSuggestedQuantity, setCurrentSuggestedQuantity] = useState(0);

    // Resolve Stock Modal State
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedProductForResolve, setSelectedProductForResolve] = useState<InventoryProduct | null>(null);

    const filteredData = inventoryData.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenRequestModal = (product: InventoryProduct, suggestedQty: number) => {
        setSelectedProductForRequest(product);
        setCurrentSuggestedQuantity(suggestedQty);
        setIsRequestModalOpen(true);
    };

    const handleCloseRequestModal = () => {
        setSelectedProductForRequest(null);
        setIsRequestModalOpen(false);
    };

    const handleRequestStock = (sku: string, quantity: number, date: string) => {
        console.log(`Solicitud de stock para ${sku}: Cantidad ${quantity}, Para el ${date}`);
        alert(`Solicitud enviada: ${quantity} unidades para el ${date}`);
        handleCloseRequestModal();
    };

    const handleOpenResolveModal = (product: InventoryProduct) => {
        setSelectedProductForResolve(product);
        setIsResolveModalOpen(true);
    };

    const handleCloseResolveModal = () => {
        setSelectedProductForResolve(null);
        setIsResolveModalOpen(false);
    };

    const handleResolveStock = (sku: string, returnQty: number, discardQty: number) => {
        onResolveStock(sku, returnQty, discardQty);
        handleCloseResolveModal();
    };
    
    return (
        <>
            <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg font-sans">
                <header className="flex items-start justify-between mb-2 flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-sky-100 rounded-md">
                            <StockControlIcon className="w-8 h-8 text-sky-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Control de Stock</h1>
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
                            placeholder="Buscar por Código o Nombre..." 
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
                                {['CÓDIGO', 'PRODUCTO', 'UNIDAD', 'STOCK MERMA', 'STOCK CUARENTENA', 'STOCK DISPONIBLE', 'POR LLEGAR', 'STOCK MÍNIMO', 'STOCK MÁXIMO', 'SUGERIDO COMPRA', 'ALERTA', 'ACCIÓN'].map(header => (
                                    <th key={header} scope="col" className="px-4 py-3 font-bold border border-gray-200 whitespace-nowrap">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => {
                                const isAlert = item.availableStock <= item.minStock;
                                // Calculate Purchase Suggestion: Max - (Available + Incoming)
                                // Ensure it doesn't go below 0
                                const incoming = item.incomingStock || 0;
                                const purchaseSuggestion = Math.max(0, item.maxStock - (item.availableStock + incoming));

                                return (
                                    <tr key={item.sku} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium border-r border-gray-100">{item.sku}</td>
                                        <td className="px-4 py-3 border-r border-gray-100">
                                            <div className="font-semibold">{item.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center border-r border-gray-100">{item.unit}</td>
                                        <td className="px-4 py-3 text-center text-red-500 border-r border-gray-100">{item.wasteStock}</td>
                                        <td className="px-4 py-3 text-center text-orange-500 border-r border-gray-100">{item.quarantineStock}</td>
                                        <td className="px-4 py-3 text-center font-semibold border-r border-gray-100">{item.availableStock}</td>
                                        <td className="px-4 py-3 text-center text-blue-600 border-r border-gray-100">{incoming > 0 ? incoming : '-'}</td>
                                        <td className="px-4 py-3 text-center border-r border-gray-100">{item.minStock}</td>
                                        <td className="px-4 py-3 text-center border-r border-gray-100">{item.maxStock}</td>
                                        <td className="px-4 py-3 text-center font-bold text-purple-600 border-r border-gray-100">{purchaseSuggestion}</td>
                                        <td className="px-4 py-3 text-center border-r border-gray-100">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${isAlert ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {isAlert ? 'BAJO STOCK' : 'OK'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => handleOpenRequestModal(item, purchaseSuggestion)}
                                                    className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-1.5 px-4 rounded transition-colors text-xs shadow-sm"
                                                >
                                                    Solicitar
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenResolveModal(item)}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 px-4 rounded transition-colors text-xs shadow-sm"
                                                >
                                                    Resolver
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {filteredData.length === 0 && (
                        <div className="text-center py-8 bg-white border-b">
                            <p className="text-gray-500">No se encontraron productos que coincidan con la búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>

            {isRequestModalOpen && selectedProductForRequest && (
                <RequestStockModal
                    product={selectedProductForRequest}
                    suggestedQuantity={currentSuggestedQuantity}
                    onClose={handleCloseRequestModal}
                    onSubmit={handleRequestStock}
                />
            )}

            {isResolveModalOpen && selectedProductForResolve && (
                <ResolveStockModal
                    product={selectedProductForResolve}
                    onClose={handleCloseResolveModal}
                    onSubmit={handleResolveStock}
                />
            )}
        </>
    );
};

export default StockControl;
