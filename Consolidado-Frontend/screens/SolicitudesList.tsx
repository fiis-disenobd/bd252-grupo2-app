import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../types';
// Usamos el tipo real del Backend
import { SolicitudCotizacion } from '../interfaces/AbastecimientoTypes'; 
// Importamos el servicio
import { abastecimientoService } from '../services/AbastecimientoService';
import { PlusIcon, SearchIcon, SalesIcon, BackIcon, ViewIcon, RegisterQuoteIcon, ChecklistIcon } from '../components/icons/IconsAbastecimiento';

interface SolicitudesListProps {
  onNavigate: (screen: Screen) => void;
  // Eliminamos 'solicitudes' de aquí porque se cargan internamente
  onViewSolicitud: (solicitud: SolicitudCotizacion) => void;
  onRegisterQuote: (solicitud: SolicitudCotizacion) => void;
  onEvaluateQuotes: (solicitud: SolicitudCotizacion) => void;
}

const SolicitudesList: React.FC<SolicitudesListProps> = ({ onNavigate, onViewSolicitud, onRegisterQuote, onEvaluateQuotes }) => {

  // 1. ESTADOS
  const [solicitudes, setSolicitudes] = useState<SolicitudCotizacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 2. CARGAR DATOS (useEffect)
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
        setLoading(true);
        const data = await abastecimientoService.getSolicitudesResumen();
        setSolicitudes(data);
        setError(null);
    } catch (err) {
        console.error("Error cargando solicitudes:", err);
        setError("Error al cargar la lista de solicitudes.");
    } finally {
        setLoading(false);
    }
  };

  // 3. FILTRO Y ORDENAMIENTO
  const filteredSolicitudes = useMemo(() => {
    let data = [...solicitudes];

    // Filtro por buscador
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(s => 
            s.cod_solicitud.toString().includes(term) || 
            s.estado.toLowerCase().includes(term)
        );
    }

    // Ordenar: Las más recientes (ID más alto) primero
    return data.sort((a, b) => b.cod_solicitud - a.cod_solicitud);
  }, [solicitudes, searchTerm]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Generada': return 'text-blue-700 bg-blue-100';
      case 'Enviada': return 'text-yellow-700 bg-yellow-100';
      case 'Cotizada': return 'text-green-700 bg-green-100';
      case 'Adjudicada': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // 4. RENDERIZADO
  if (loading && solicitudes.length === 0) return <div className="p-10 text-center text-sky-700 animate-pulse">Cargando solicitudes...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}<br/><button onClick={cargarDatos} className="underline">Reintentar</button></div>;

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(Screen.MainMenu)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Volver al menú principal">
                <BackIcon className="h-6 w-6 text-gray-600"/>
            </button>
            <div className="flex items-center">
                <div className="w-16 h-16 mr-4 p-2 bg-sky-100 rounded-lg flex items-center justify-center">
                  <SalesIcon className="w-12 h-12 text-sky-700"/>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Solicitudes de Cotización</h1>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar solicitud..." 
                    className="border-2 border-gray-300 rounded-lg p-2 pl-4 pr-10 focus:outline-none focus:border-sky-500" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
            </div>
            <button 
              onClick={() => onNavigate(Screen.GroupItemsForQuotation)}
              className="flex items-center bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
            >
              Generar Solicitud
              <div className="ml-2 bg-white rounded-full p-1">
                <PlusIcon className="h-5 w-5 text-sky-600"/>
              </div>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="min-w-full bg-white">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">CODIGO</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">FECHA EMISION</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">ESTADO</th>
              <th className="text-center py-3 px-4 uppercase font-semibold text-sm">TOTAL DE ITEMS</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm text-center">VER</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredSolicitudes.map((solicitud, index) => (
              <tr key={solicitud.cod_solicitud} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200 hover:bg-sky-50`}>
                
                {/* ID Numérico formateado */}
                <td className="text-left py-3 px-4 font-medium">
                    {solicitud.cod_solicitud}
                </td>
                
                {/* Fecha directa del backend */}
                <td className="text-left py-3 px-4">{solicitud.fecha_emision}</td>
                
                <td className="text-left py-3 px-4">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusClass(solicitud.estado)}`}>
                        {solicitud.estado}
                    </span>
                </td>
                
                {/* Total calculado por el backend */}
                <td className="text-center py-3 px-4">{solicitud.total_de_items}</td>
                
                <td className="text-center py-3 px-4">
                    <button onClick={() => onViewSolicitud(solicitud)} className="text-sky-600 hover:text-sky-800">
                        <ViewIcon className="w-5 h-5"/>
                    </button>
                </td>
                
                <td className="text-center py-3 px-4 h-[53px]">
                  {/* Acciones Condicionales */}
                  {(solicitud.estado === 'Generada' || solicitud.estado === 'Enviada') && (
                    <button onClick={() => onRegisterQuote(solicitud)} className="text-gray-500 hover:text-gray-700" title="Registrar Cotización">
                        <RegisterQuoteIcon className="w-5 h-5"/>
                    </button>
                  )}
                  {solicitud.estado === 'Cotizada' && (
                     <button onClick={() => onEvaluateQuotes(solicitud)} className="text-gray-500 hover:text-gray-700" title="Evaluar Ofertas">
                        <ChecklistIcon className="w-5 h-5"/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSolicitudes.length === 0 && (
            <div className="p-8 text-center text-gray-500">
                No se encontraron solicitudes registradas.
            </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudesList;