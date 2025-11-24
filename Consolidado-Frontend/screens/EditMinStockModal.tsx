import React, { useState } from 'react';
import { InventoryProduct } from '../types';

interface EditMinStockModalProps {
    product: InventoryProduct;
    onClose: () => void;
    onSave: (sku: string, newMinStock: number, newMaxStock: number) => void;
}

const EditMinStockModal: React.FC<EditMinStockModalProps> = ({ product, onClose, onSave }) => {
    const [minStock, setMinStock] = useState(product.minStock);
    const [maxStock, setMaxStock] = useState(product.maxStock);

    const handleSave = () => {
        onSave(product.sku, minStock, maxStock);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Editar Límites de Stock</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        aria-label="Cerrar modal"
                    >&times;</button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600">Producto</p>
                        <p className="font-semibold text-gray-800">{product.name} ({product.sku})</p>
                    </div>
                    <div>
                        <label htmlFor="minStockInput" className="block text-sm font-medium text-gray-700 mb-1">
                            Nuevo Stock Mínimo
                        </label>
                        <input
                            id="minStockInput"
                            type="number"
                            value={minStock}
                            onChange={(e) => setMinStock(parseInt(e.target.value, 10) || 0)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            min="0"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxStockInput" className="block text-sm font-medium text-gray-700 mb-1">
                            Nuevo Stock Máximo
                        </label>
                        <input
                            id="maxStockInput"
                            type="number"
                            value={maxStock}
                            onChange={(e) => setMaxStock(parseInt(e.target.value, 10) || 0)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            min="0"
                        />
                    </div>
                </main>
                <footer className="flex justify-end items-center p-4 bg-gray-50 border-t gap-4">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Guardar Cambios
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EditMinStockModal;