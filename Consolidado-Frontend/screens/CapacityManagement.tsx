import React, { useState } from 'react';
import { BackIcon, HomeIcon, CapacityIcon } from '../components/icons/IconsAlmacen';

interface CapacityManagementProps {
    onBack: () => void;
    onHome: () => void;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const startHour = 6 + i;
    const endHour = startHour + 1;
    return `${startHour}:00-${endHour}:00`;
});

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const CapacityManagement: React.FC<CapacityManagementProps> = ({ onBack, onHome }) => {
    const [selectedInstallation, setSelectedInstallation] = useState('Almacen 1');
    const [capacityData, setCapacityData] = useState<number[][]>(() => 
        Array(timeSlots.length).fill(null).map(() => Array(daysOfWeek.length).fill(0))
    );

    const handleDataChange = (rowIndex: number, colIndex: number, value: string) => {
        const newValue = parseInt(value, 10);
        if (!isNaN(newValue)) {
            const newData = [...capacityData];
            newData[rowIndex][colIndex] = newValue;
            setCapacityData(newData);
        } else if (value === '') {
            const newData = [...capacityData];
            newData[rowIndex][colIndex] = 0;
            setCapacityData(newData);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg font-sans">
            <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-sky-100 rounded-md">
                        <CapacityIcon className="w-8 h-8 text-sky-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestión de Capacidad</h1>
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
            
            <div className="my-6">
                <label htmlFor="installation-select" className="block text-lg font-medium text-gray-700 mb-2">
                    Seleccionar Instalación
                </label>
                <select
                    id="installation-select"
                    value={selectedInstallation}
                    onChange={(e) => setSelectedInstallation(e.target.value)}
                    className="w-full max-w-xs border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-black"
                >
                    <option value="Almacen 1">Almacen 1</option>
                    <option value="Almacen 2">Almacen 2</option>
                    <option value="Tienda física">Tienda física</option>
                </select>
            </div>

            <div className="overflow-x-auto mt-8">
                <table className="w-full text-sm text-center text-gray-600 border-collapse">
                    <thead className="text-xs text-white uppercase bg-[#1E3A8A]">
                        <tr>
                            <th scope="col" className="px-2 py-3 border border-gray-300 sticky left-0 bg-[#1E3A8A] z-10">Horario</th>
                            {daysOfWeek.map(day => (
                                <th key={day} scope="col" className="px-4 py-3 border border-gray-300">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot, rowIndex) => (
                            <tr key={slot} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-2 py-2 border border-gray-300 font-medium text-gray-800 sticky left-0 bg-white z-10 whitespace-nowrap">
                                    {slot}
                                </th>
                                {daysOfWeek.map((_, colIndex) => (
                                    <td key={colIndex} className="px-1 py-1 border border-gray-300">
                                        <input
                                            type="number"
                                            value={capacityData[rowIndex][colIndex] === 0 ? '' : capacityData[rowIndex][colIndex]}
                                            onChange={(e) => handleDataChange(rowIndex, colIndex, e.target.value)}
                                            className="w-20 h-full text-center border-none rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-transparent hover:bg-gray-100"
                                            aria-label={`Capacidad para ${slot} el ${daysOfWeek[colIndex]}`}
                                            min="0"
                                            placeholder="0"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-end mt-8 gap-4">
                <button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                    Generar cupos del próximo mes
                </button>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};

export default CapacityManagement;