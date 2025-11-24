
import React, { useState } from 'react';
import { InventoryProduct } from '../types';

interface ResolveStockModalProps {
    product: InventoryProduct;
    onClose: () => void;
    onSubmit: (sku: string, returnQty: number, discardQty: number) => void;
}

const ResolveStockModal: React.FC<ResolveStockModalProps> = ({ product, onClose, onSubmit }) => {
    const [returnQty, setReturnQty] = useState(0);
    const [discardQty, setDiscardQty] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(product.sku, returnQty, discardQty);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Resolver Incidencias de Stock</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        aria-label="Cerrar modal"
                    >&times;</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div className="bg-red-50 p-3 rounded-md border border-red-100">
                            <p className="text-sm text-red-800 font-bold">Producto: {product.name}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-800">Cuarentena: <strong>{product.quarantineStock}</strong></span>
                                <span className="text-gray-800">Merma: <strong>{product.wasteStock}</strong></span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="returnQty" className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad a Devolver (Reduce Cuarentena)
                            </label>
                            <input
                                id="returnQty"
                                type="number"
                                value={returnQty}
                                onChange={(e) => setReturnQty(Math.min(product.quarantineStock, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                                className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                min="0"
                                max={product.quarantineStock}
                            />
                        </div>

                         <div>
                            <label htmlFor="discardQty" className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad a Desechar (Reduce Merma)
                            </label>
                            <input
                                id="discardQty"
                                type="number"
                                value={discardQty}
                                onChange={(e) => setDiscardQty(Math.min(product.wasteStock, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                                className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                min="0"
                                max={product.wasteStock}
                            />
                        </div>
                    </main>

                    <footer className="flex justify-end items-center p-4 bg-gray-50 border-t gap-4">
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                            disabled={returnQty === 0 && discardQty === 0}
                        >
                            Resolver
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ResolveStockModal;
