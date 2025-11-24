
import React, { useState, useEffect } from 'react';
import { InventoryProduct } from '../types';

interface RequestStockModalProps {
    product: InventoryProduct;
    suggestedQuantity: number;
    onClose: () => void;
    onSubmit: (sku: string, quantity: number, date: string) => void;
}

const RequestStockModal: React.FC<RequestStockModalProps> = ({ product, suggestedQuantity, onClose, onSubmit }) => {
    const [quantity, setQuantity] = useState(suggestedQuantity);
    const [date, setDate] = useState('');

    useEffect(() => {
        // Set default date to today or tomorrow? Let's set to tomorrow as a "desired date" default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        setDate(formattedDate);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(product.sku, quantity, date);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Solicitar Reposición</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        aria-label="Cerrar modal"
                    >&times;</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                            <p className="text-sm text-blue-800 font-bold">Producto</p>
                            <p className="text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-600 font-mono">{product.sku}</p>
                        </div>

                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad a solicitar
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                min="1"
                                required
                            />
                            {quantity !== suggestedQuantity && (
                                <p className="text-xs text-orange-600 mt-1">
                                    Sugerido: {suggestedQuantity} {product.unit}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha requerida
                            </label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                required
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Confirmar Solicitud
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default RequestStockModal;
