import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../types'; 
import { PedidoAbastecimiento } from '../interfaces/AbastecimientoTypes'; // Tu tipo real
import { abastecimientoService } from '../services/AbastecimientoService'; // Tu servicio real
import { SearchIcon, ViewIcon, RequestsIcon, BackIcon } from '../components/icons/IconsAbastecimiento';

interface PedidosListProps {
  onNavigate: (screen: Screen) => void;
  // Ya no pedimos 'pedidos' por props, porque el componente los buscará él mismo
  onViewPedido: (pedido: PedidoAbastecimiento) => void;
}

const PedidosList: React.FC<PedidosListProps> = ({ onNavigate, onViewPedido }) => {

  // 1. ESTADOS (Igual que en tu ejemplo del Modal)
  const [pedidos, setPedidos] = useState<PedidoAbastecimiento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Añadí estado para el buscador

  // 2. CARGAR DATOS DEL BACKEND (useEffect)
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
        setLoading(true);
        const data = await abastecimientoService.getPedidosResumen();
        setPedidos(data);
        setError(null);
    } catch (err) {
        console.error("Error cargando pedidos:", err);
        setError("Error de conexión. Intente nuevamente.");
    } finally {
        setLoading(false);
    }
  };

  // 3. LÓGICA DE ORDENAMIENTO Y FILTRADO
  const filteredAndSortedPedidos = useMemo(() => {
    let data = [...pedidos];

    // A. Filtrar por buscador (Si escriben algo)
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(p => 
            p.cod_pedido.toString().includes(term) || 
            p.estado_pedido.toLowerCase().includes(term)
        );
    }

    // B. Ordenar por Estado y luego por ID
    const statusOrder: Record<string, number> = { 
        'Pendiente': 1, 
        'Revisado': 2, 
        'En Proceso': 3,
        'Atendido': 4,
        'Cancelado': 5 
    };

    return data.sort((a, b) => {
        const orderA = statusOrder[a.estado_pedido] || 99;
        const orderB = statusOrder[b.estado_pedido] || 99;
        
        if (orderA !== orderB) return orderA - orderB;
        return b.cod_pedido - a.cod_pedido; 
    });
  }, [pedidos, searchTerm]);

  const getStatusClass = (status: string) => {
    switch (status) {
        case 'Pendiente': return 'text-yellow-700 bg-yellow-100';
        case 'Revisado': return 'text-blue-700 bg-blue-100';
        case 'En Proceso': return 'text-indigo-700 bg-indigo-100';
        case 'Atendido': return 'text-green-700 bg-green-100';
        case 'Cancelado': return 'text-red-700 bg-red-100';
        default: return 'text-gray-700 bg-gray-100';
    }
  };

  // 4. RENDERIZADO DE CARGA O ERROR
  if (loading && pedidos.length === 0) {
      return <div className="p-10 text-center text-sky-700 animate-pulse">Cargando lista de pedidos...</div>;
  }

  if (error) {
      return (
        <div className="p-10 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={cargarDatos} className="text-sky-600 underline">Reintentar</button>
        </div>
      );
  }

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(Screen.MainMenu)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                <BackIcon className="h-6 w-6 text-gray-600"/>
            </button>
            <div className="flex items-center">
                <div className="w-16 h-16 mr-4 p-2 bg-sky-100 rounded-lg flex items-center justify-center">
                  <RequestsIcon className="w-12 h-12 text-sky-700"/>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Pedidos de Abastecimiento</h1>
            </div>
        </div>
        
        {/* Buscador Funcional */}
        <div className="flex items-center space-x-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar pedido..." 
                    className="border-2 border-gray-300 rounded-lg p-2 pl-4 pr-10 focus:outline-none focus:border-sky-500" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="min-w-full bg-white">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">CODIGO</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">FECHA PEDIDO</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">HORA PEDIDO</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">ESTADO PEDIDO</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm text-center">REVISAR</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredAndSortedPedidos.map((pedido, index) => (
              <tr key={pedido.cod_pedido} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200 hover:bg-sky-50`}>
                
               
                {/* Formato ID: 0001 */}
                <td className="text-left py-3 px-4 font-medium">
                    {pedido.cod_pedido}
                </td>
                
                <td className="text-left py-3 px-4">{pedido.fecha_pedido}</td>
                <td className="text-left py-3 px-4">{pedido.hora_pedido}</td>
                
                <td className="text-left py-3 px-4">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusClass(pedido.estado_pedido)}`}>
                        {pedido.estado_pedido}
                    </span>
                </td>
                
                <td className="text-center py-3 px-4 h-[53px]">
                  {pedido.estado_pedido === 'Pendiente' && (
                    <button onClick={() => onViewPedido(pedido)} className="text-sky-600 hover:text-sky-800">
                        <ViewIcon className="w-5 h-5"/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedPedidos.length === 0 && (
            <div className="p-8 text-center text-gray-500">
                No se encontraron pedidos registrados.
            </div>
        )}
      </div>
    </div>
  );
};

export default PedidosList;