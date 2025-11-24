import React from 'react';
import { Operator } from '../types';

interface AssignedOperatorsModalProps {
    operators: Operator[];
    onClose: () => void;
}

const AssignedOperatorsModal: React.FC<AssignedOperatorsModalProps> = ({ operators, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Operadores Asignados</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        aria-label="Cerrar modal"
                    >&times;</button>
                </header>
                <main className="p-6 max-h-[60vh] overflow-y-auto">
                    <ul className="space-y-3">
                        {operators.map(op => (
                            <li key={op.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                                <div>
                                    <p className="font-semibold text-gray-800">{op.name}</p>
                                </div>
                                <span className="text-sm font-mono text-gray-500">ID: {op.id}</span>
                            </li>
                        ))}
                    </ul>
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

export default AssignedOperatorsModal;