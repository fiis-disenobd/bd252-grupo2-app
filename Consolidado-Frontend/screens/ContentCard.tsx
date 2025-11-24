

import React from 'react';
import { EditIcon } from '../components/icons/IconsAlmacen';

interface ContentCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ icon: Icon, label, onClick }) => {
    return (
        <button 
            onClick={onClick} 
            className="flex flex-col items-center group cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-lg"
            aria-label={label}
        >
            <div className="w-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="flex items-stretch h-32">
                    <div className="w-2/3 flex items-center justify-center bg-blue-50 rounded-l-lg p-4">
                        <Icon className="w-16 h-16 text-blue-700" />
                    </div>
                    <div className="w-1/3 flex items-center justify-center bg-blue-100 rounded-r-lg border-l-2 border-white">
                        <EditIcon className="w-10 h-10 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                </div>
            </div>
            <p className="mt-3 text-center font-semibold text-gray-700 w-full px-2">{label}</p>
        </button>
    );
};

export default ContentCard;