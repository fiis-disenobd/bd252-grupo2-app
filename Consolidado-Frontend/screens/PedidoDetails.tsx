import React, { useEffect, useState } from 'react';
// Importamos AMBOS tipos: el resumen (que llega por props) y el detalle (que buscamos)
import { PedidoAbastecimiento, PedidoDetalle } from '../interfaces/AbastecimientoTypes'; 
import { abastecimientoService } from '../services/AbastecimientoService';
import { BackIcon, RequestsIcon, SaveIcon } from '../components/icons/IconsAbastecimiento';

interface PedidoDetailsProps {
  // Recibimos el objeto resumen que ya tiene App.tsx
  pedido: PedidoAbastecimiento; 
  onBack: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500 uppercase font-medium">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value || '-'}</p>
    </div>
);

const PedidoDetails: React.FC<PedidoDetailsProps> = ({ pedido: pedidoResumen, onBack }) => {
  
  // Estado para el detalle completo (inicialmente null)
  const [pedidoFull, setPedidoFull] = useState<PedidoDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // AL MONTAR: Usamos el ID del resumen para buscar los detalles completos
  useEffect(() => {
    const cargarDetalleCompleto = async () => {
        try {
            setLoading(true);
            // ¡Aquí ocurre la magia! Usamos el ID del prop para buscar el resto
            const data = await abastecimientoService.getPedidoDetalle(pedidoResumen.cod_pedido);
            setPedidoFull(data);
        } catch (err) {
            console.error("Error cargando detalle completo:", err);
        } finally {
            setLoading(false);
        }
    };

    if (pedidoResumen?.cod_pedido) {
        cargarDetalleCompleto();
    }
  }, [pedidoResumen]);

  const handleMarkAsReviewed = async () => {
    if (!pedidoResumen) return;
    try {
        setUpdating(true);
        await abastecimientoService.marcarPedidoRevisado(pedidoResumen.cod_pedido);
        
        // Actualizamos el estado local para reflejar el cambio
        if (pedidoFull) setPedidoFull({ ...pedidoFull, estado_pedido: 'Revisado' });
        alert("Pedido marcado como revisado.");
    } catch (err) {
        alert("Error al actualizar estado.");
    } finally {
        setUpdating(false);
    }
  };

  // Combinamos datos: Usamos Full si existe, sino usamos el Resumen como fallback visual
  const dataToShow = pedidoFull || pedidoResumen;
  // Nota: 'productos' solo existe en pedidoFull, así que verificamos
  const productos = pedidoFull?.productos || [];

  return (
    <div className="p-4 max-w-6xl mx-auto animate-fadeIn">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                <BackIcon className="h-6 w-6 text-gray-600"/>
            </button>
            <div className="flex items-center">
                <div className="w-16 h-16 mr-4 p-2 bg-sky-100 rounded-lg flex items-center justify-center">
                  <RequestsIcon className="w-12 h-12 text-sky-700"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Detalle del Pedido</h1>
                    <p className="text-lg text-gray-500 font-mono">
                        #{String(dataToShow.cod_pedido).padStart(4, '0')}
                    </p>
                </div>
            </div>
        </div>

        {dataToShow.estado_pedido === 'Pendiente' && (
            <button 
                onClick={handleMarkAsReviewed}
                disabled={updating}
                className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all ${updating ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'}`}
            >
                {updating ? 'Guardando...' : 'Marcar como Revisado'}
                {!updating && <SaveIcon className="ml-2 h-5 w-5"/>}
            </button>
        )}
      </div>

      <div className="space-y-8">
        {/* TARJETA 1: DATOS GENERALES */}
        <div className="bg-white p-6 rounded-lg border-2 border-sky-700 shadow-sm relative">
            {loading && <div className="absolute top-4 right-4 text-sky-600 text-sm animate-pulse">Actualizando datos...</div>}
            
            <h2 className="text-xl font-bold text-sky-800 border-b-2 border-sky-200 pb-2 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DetailItem label="Código" value={String(dataToShow.cod_pedido).padStart(4, '0')} />
                <DetailItem label="Fecha" value={dataToShow.fecha_pedido} />
                <DetailItem label="Hora" value={dataToShow.hora_pedido} />
                <DetailItem label="Estado" value={dataToShow.estado_pedido} />
                {/* Este campo solo aparece cuando carga el Full */}
                <DetailItem label="Área" value={(dataToShow as PedidoDetalle).valor_area || 'Cargando...'} />
            </div>
        </div>

        {/* TARJETA 2: PRODUCTOS (Solo disponible cuando carga el Full) */}
        <div className="bg-white p-6 rounded-lg border-2 border-sky-700 shadow-sm min-h-[200px]">
             <h2 className="text-xl font-bold text-sky-800 border-b-2 border-sky-200 pb-2 mb-4">Productos Requeridos</h2>
             
             {loading && !pedidoFull ? (
                 <div className="flex justify-center items-center py-10 text-gray-400">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700 mr-3"></div>
                     Cargando productos...
                 </div>
             ) : productos.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-sky-700 text-white">
                            <tr>
                                <th className="text-left py-3 px-4">PRODUCTO</th>
                                <th className="text-center py-3 px-4">CANTIDAD</th>
                                <th className="text-left py-3 px-4">UNIDAD</th>
                                <th className="text-left py-3 px-4">FECHA REQ.</th>
                                <th className="text-left py-3 px-4">DESTINO</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 divide-y divide-gray-200">
                            {productos.map((p, i) => (
                                <tr key={i} className="hover:bg-sky-50">
                                    <td className="py-3 px-4 font-medium">{p.nombre_producto}</td>
                                    <td className="py-3 px-4 text-center font-bold text-sky-700">{p.cantidad_requerida}</td>
                                    <td className="py-3 px-4 text-gray-500">{p.unidad_medida}</td>
                                    <td className="py-3 px-4">{p.fecha_requerida}</td>
                                    <td className="py-3 px-4">{p.tipo_destino}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <p className="text-gray-500 italic text-center py-4">No hay productos registrados.</p>
             )}
        </div>
      </div>
    </div>
  );
};

export default PedidoDetails;