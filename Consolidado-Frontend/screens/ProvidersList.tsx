import React, { useState, useMemo, useEffect } from 'react';
import { Screen } from '../types';
// Importamos la interfaz real que coincide con tu DTO Java
import { Proveedor } from '../interfaces/AbastecimientoTypes';
// Importamos el servicio para hacer la petición
import { abastecimientoService } from '../services/AbastecimientoService';
import { PlusIcon, SearchIcon, ViewIcon, EditIcon, ClientsIcon, BackIcon } from '../components/icons/IconsAbastecimiento';

interface ProvidersListProps {
  onNavigate: (screen: Screen) => void;
  // Ya no recibimos 'providers' por props, el componente los carga solo
  onViewProvider: (provider: Proveedor) => void;
  onRegister: () => void;
  onEditProvider: (provider: Proveedor) => void;
}

const ProvidersList: React.FC<ProvidersListProps> = ({ onNavigate, onViewProvider, onRegister, onEditProvider }) => {
  
  // 1. ESTADOS
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. CARGAR DATOS DEL BACKEND
  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
        setLoading(true);
        const data = await abastecimientoService.listarTodosProveedores();
        setProviders(data);
        setError(null);
    } catch (err) {
        console.error("Error al cargar proveedores:", err);
        setError("No se pudo cargar la lista de proveedores. Verifique la conexión.");
    } finally {
        setLoading(false);
    }
  };

  // 3. FILTRADO LOCAL
  const filteredProviders = useMemo(() => {
    if (!searchTerm) {
      return providers;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return providers.filter(provider =>
      provider.nombre_comercial.toLowerCase().includes(lowercasedTerm) ||
      provider.razon_social.toLowerCase().includes(lowercasedTerm) ||
      provider.ruc.toLowerCase().includes(lowercasedTerm)
    );
  }, [providers, searchTerm]);

  // 4. RENDERIZADO
  if (loading && providers.length === 0) {
      return <div className="p-10 text-center text-sky-700 animate-pulse">Cargando directorio de proveedores...</div>;
  }

  if (error) {
      return (
        <div className="p-10 text-center text-red-600">
            {error}<br/>
            <button onClick={cargarProveedores} className="underline mt-2 font-bold">Reintentar</button>
        </div>
      );
  }

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(Screen.MainMenu)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Volver al menú principal">
                <BackIcon className="h-6 w-6 text-gray-600"/>
            </button>
            <div className="flex items-center">
                <div className="w-16 h-16 mr-4 p-2 bg-sky-100 rounded-lg flex items-center justify-center">
                  <ClientsIcon className="w-12 h-12 text-sky-700"/>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Proveedores</h1>
            </div>
        </div>
        
        <div className="flex items-center space-x-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar por Nombre, Razón Social o RUC..." 
                    className="border-2 border-gray-300 rounded-lg p-2 pl-4 pr-10 focus:outline-none focus:border-sky-500 w-80" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
            </div>
            <button 
              onClick={onRegister}
              className="flex items-center bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
            >
              Registrar Proveedor
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
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Nombre Comercial</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Razón Social</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">RUC</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm text-center">Ver</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm text-center">Editar</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredProviders.map((provider) => (
              <tr key={provider.cod_proveedor} className="border-b border-gray-200 hover:bg-sky-50 transition-colors">
                <td className="text-left py-3 px-4 font-medium text-gray-900">{provider.nombre_comercial}</td>
                <td className="text-left py-3 px-4">{provider.razon_social}</td>
                <td className="text-left py-3 px-4 font-mono">{provider.ruc}</td>
                <td className="text-center py-3 px-4">
                    <button onClick={() => onViewProvider(provider)} className="text-sky-600 hover:text-sky-800" aria-label={`Ver ${provider.nombre_comercial}`}>
                        <ViewIcon className="w-5 h-5"/>
                    </button>
                </td>
                 <td className="text-center py-3 px-4">
                    <button onClick={() => onEditProvider(provider)} className="text-gray-500 hover:text-gray-700" aria-label={`Editar ${provider.nombre_comercial}`}>
                        <EditIcon className="w-5 h-5"/>
                    </button>
                </td>
              </tr>
            ))}
            
            {filteredProviders.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                        No se encontraron proveedores registrados.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvidersList;