import React from 'react';
import { BackIcon, HomeIcon, GearsIcon, UserIcon } from '../components/icons/IconsAlmacen';
import { View } from '../types';

interface TeamDashboardProps {
    onNavigate: (view: View) => void;
    onBack: () => void;
    onHome: () => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ onNavigate, onBack, onHome }) => {
    return (
        <div className="bg-white p-6 md:p-8 border border-gray-300 rounded-lg shadow-lg">
            <header className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Gestionar Equipo y Reservas</h1>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <button 
                    onClick={() => onNavigate('team-management')}
                    className="flex flex-col items-center justify-center p-8 bg-sky-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    aria-label="Gestionar Reservas"
                >
                    <GearsIcon className="w-20 h-20 text-sky-600 mb-4" />
                    <span className="text-xl font-semibold text-gray-700">Gestionar Reservas</span>
                </button>

                <button 
                    onClick={() => onNavigate('operator-management')}
                    className="flex flex-col items-center justify-center p-8 bg-indigo-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Gestionar Operadores"
                >
                    <UserIcon className="w-20 h-20 text-indigo-600 mb-4" />
                    <span className="text-xl font-semibold text-gray-700">Gestionar Operadores</span>
                </button>
            </div>
        </div>
    );
};

export default TeamDashboard;