
import React, { useState, useRef } from 'react';
import { ProductAlmacen, Incident, IncidentType } from '../types';

interface IncidentReportModalProps {
    product: ProductAlmacen;
    onClose: () => void;
    onSubmit: (incidents: Incident[]) => void;
}

const incidentTypes: IncidentType[] = ['Roto', 'Húmedo', 'Incompleto', 'Oxidado'];

// We define an internal type with a unique ID for React keys and state management
type IncidentForm = {
    id: number;
    type: IncidentType;
    quantity: number;
    description: string;
};

const IncidentReportModal: React.FC<IncidentReportModalProps> = ({ product, onClose, onSubmit }) => {
    const nextId = useRef(1);
    const [incidents, setIncidents] = useState<IncidentForm[]>([
        { id: 0, type: 'Roto', quantity: 0, description: '' }
    ]);

    const handleAddForm = () => {
        const newIncident: IncidentForm = {
            id: nextId.current++,
            type: 'Roto',
            quantity: 0,
            description: ''
        };
        setIncidents([...incidents, newIncident]);
    };
    
    const handleRemoveForm = (idToRemove: number) => {
        if (incidents.length > 1) {
            setIncidents(incidents.filter(inc => inc.id !== idToRemove));
        }
    };

    const handleIncidentChange = (id: number, field: keyof Omit<IncidentForm, 'id'>, value: string | number) => {
        setIncidents(prevIncidents => 
            prevIncidents.map(inc => 
                inc.id === id ? { ...inc, [field]: value } : inc
            )
        );
    };

    const handleSubmit = () => {
        const validIncidents: Incident[] = incidents
            .filter(inc => inc.quantity > 0)
            .map(({ id, ...rest }) => ({
                ...rest,
                description: rest.description || undefined,
            }));
        
        if (validIncidents.length > 0) {
            onSubmit(validIncidents);
        } else {
             // If no valid incidents were added, just close the modal.
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        Reportar Incidencia para: <span className="text-sky-600">{product.name}</span>
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        aria-label="Cerrar modal"
                    >&times;</button>
                </header>
                
                <main className="p-6 overflow-y-auto flex-grow space-y-4">
                    {incidents.map((incident, index) => (
                        <div key={incident.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                            {incidents.length > 1 && (
                                <button
                                    onClick={() => handleRemoveForm(incident.id)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm hover:bg-red-600 transition-colors"
                                    aria-label={`Quitar incidencia ${index + 1}`}
                                >
                                    &times;
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="md:col-span-1">
                                    <label htmlFor={`incident-type-${incident.id}`} className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select 
                                        id={`incident-type-${incident.id}`}
                                        value={incident.type}
                                        onChange={(e) => handleIncidentChange(incident.id, 'type', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    >
                                        {incidentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor={`quantity-${incident.id}`} className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                    <input 
                                        id={`quantity-${incident.id}`}
                                        type="number"
                                        value={incident.quantity}
                                        onChange={(e) => handleIncidentChange(incident.id, 'quantity', parseInt(e.target.value, 10) || 0)}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        min="0"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                     <label htmlFor={`description-${incident.id}`} className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                                     <input
                                        id={`description-${incident.id}`}
                                        type="text"
                                        value={incident.description}
                                        onChange={(e) => handleIncidentChange(incident.id, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                     />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="mt-4">
                        <button 
                            onClick={handleAddForm}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                        >
                            + Añadir otro tipo de incidencia
                        </button>
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
                        onClick={handleSubmit} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Guardar Incidencias
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default IncidentReportModal;
