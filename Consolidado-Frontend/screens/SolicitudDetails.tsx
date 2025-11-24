import React, { useEffect, useState } from 'react';
// Importamos los tipos reales
import { SolicitudCotizacion, ProductoParaCotizar, DetalleOferta } from '../interfaces/AbastecimientoTypes';
// Importamos el servicio
import { abastecimientoService } from '../services/AbastecimientoService';
import { BackIcon, SalesIcon } from '../components/icons/IconsAbastecimiento';

interface SolicitudDetailsProps {
  // Recibimos el resumen desde el padre (App.tsx / Lista)
  solicitud: SolicitudCotizacion; 
  onBack: () => void;
}

// Interfaz auxiliar para mostrar la cotización completa en pantalla
interface CotizacionVisual {
    id_proveedor: number;
    nombre_proveedor: string;
    items: DetalleOferta[];
    monto_total: number;
}

const DetailItem: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <p className="text-sm text-gray-500 uppercase font-medium">{label}</p>
        {value && <p className="text-lg font-semibold text-gray-800">{value}</p>}
        {children}
    </div>
);

const SolicitudDetails: React.FC<SolicitudDetailsProps> = ({ solicitud, onBack }) => {

  // 1. ESTADOS PARA DATOS ADICIONALES
  const [items, setItems] = useState<ProductoParaCotizar[]>([]);
  const [cotizaciones, setCotizaciones] = useState<CotizacionVisual[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. CARGAR DETALLES COMPLETOS (useEffect)
  useEffect(() => {
    const cargarDatosAdicionales = async () => {
        try {
            setLoading(true);
            
            // A. Cargar los productos de la solicitud
            const productosData = await abastecimientoService.getProductosParaCotizar(solicitud.cod_solicitud);
            setItems(productosData);

            // B. Cargar Cotizaciones (Solo si el estado indica que hay)
            if (solicitud.estado === 'Cotizada' || solicitud.estado === 'Adjudicada') {
                // 1. Obtener proveedores que cotizaron
                const proveedores = await abastecimientoService.getProveedoresCotizantes(solicitud.cod_solicitud);
                
                // 2. Para cada proveedor, obtener su oferta detallada
                const cotizacionesPromesas = proveedores.map(async (prov) => {
                    const detalles = await abastecimientoService.getOfertaProveedor(solicitud.cod_solicitud, prov.cod_proveedor);
                    // Calcular total sumando los items
                    const total = detalles.reduce((sum, d) => sum + (d.costo_total || 0), 0);
                    
                    return {
                        id_proveedor: prov.cod_proveedor,
                        nombre_proveedor: prov.nombre_comercial,
                        items: detalles,
                        monto_total: total
                    } as CotizacionVisual;
                });

                const resultadosCotizaciones = await Promise.all(cotizacionesPromesas);
                setCotizaciones(resultadosCotizaciones);
            }

        } catch (error) {
            console.error("Error cargando detalles de solicitud:", error);
        } finally {
            setLoading(false);
        }
    };

    if (solicitud) {
        cargarDatosAdicionales();
    }
  }, [solicitud]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Generada': return 'text-blue-700 bg-blue-100';
      case 'Enviada': return 'text-yellow-700 bg-yellow-100';
      case 'Cotizada': return 'text-green-700 bg-green-100';
      case 'Adjudicada': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto animate-fadeIn">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Volver a la lista">
                <BackIcon className="h-6 w-6 text-gray-600"/>
            </button>
            <div className="flex items-center">
                <div className="w-16 h-16 mr-4 p-2 bg-sky-100 rounded-lg flex items-center justify-center">
                  <SalesIcon className="w-12 h-12 text-sky-700"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Detalle de Solicitud</h1>
                    <p className="text-md text-gray-500 font-mono">
                        Código: {String(solicitud.cod_solicitud).padStart(4, '0')}
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* TARJETA 1: DATOS GENERALES */}
        <div className="bg-white p-6 rounded-lg border-2 border-sky-700 shadow-sm">
            <h2 className="text-xl font-bold text-sky-800 border-b-2 border-sky-200 pb-2 mb-4">Datos de la Solicitud</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem label="Código" value={String(solicitud.cod_solicitud).padStart(4, '0')} />
                <DetailItem label="Fecha Emisión" value={solicitud.fecha_emision} />
                <DetailItem label="Estado">
                    <span className={`px-3 py-1.5 text-lg font-semibold leading-tight rounded-full ${getStatusClass(solicitud.estado)}`}>
                        {solicitud.estado}
                    </span>
                </DetailItem>
            </div>
        </div>

        {/* TARJETA 2: ÍTEMS INCLUIDOS */}
        <div className="bg-white p-6 rounded-lg border-2 border-sky-700 shadow-sm relative">
             {loading && items.length === 0 && <div className="absolute top-4 right-4 text-sky-600 animate-pulse">Cargando productos...</div>}
             
             <h2 className="text-xl font-bold text-sky-800 border-b-2 border-sky-200 pb-2 mb-4">
                Ítems Incluidos ({items.length > 0 ? items.length : solicitud.total_de_items})
             </h2>
             
             {items.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-sky-700 text-white">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold">NOMBRE PRODUCTO</th>
                                <th className="text-center py-3 px-4 uppercase font-semibold">CANTIDAD</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold">UNIDAD</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 divide-y divide-gray-200">
                            {items.map((item, index) => (
                                <tr key={index} className="hover:bg-sky-50">
                                    <td className="text-left py-3 px-4 font-medium">{item.nombre_producto}</td>
                                    <td className="text-center py-3 px-4 font-bold text-sky-700">{item.cantidad_solicitada}</td>
                                    <td className="text-left py-3 px-4 text-gray-500">{item.unidad_medida}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <p className="text-gray-500 italic text-center py-4">
                    {loading ? "Obteniendo lista de productos..." : "No se encontraron ítems detallados."}
                </p>
             )}
        </div>
        
        {/* TARJETA 3: COTIZACIONES RECIBIDAS */}
        {cotizaciones.length > 0 && (
            <div className="bg-white p-6 rounded-lg border-2 border-green-700 shadow-sm">
                <h2 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2 mb-4">
                    Cotizaciones Recibidas
                </h2>
                {cotizaciones.map((cotizacion, index) => (
                    <div key={index} className="mb-6 last:mb-0 border border-green-200 rounded-lg overflow-hidden">
                        {/* Cabecera de la Oferta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 border-b border-green-200">
                            <DetailItem label="Proveedor" value={cotizacion.nombre_proveedor} />
                            <DetailItem label="Monto Total Calculado" value={`S/. ${cotizacion.monto_total.toFixed(2)}`} />
                        </div>
                        
                        {/* Tabla de Detalle de la Oferta */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="text-left py-2 px-4 font-semibold">Producto</th>
                                        <th className="text-center py-2 px-4 font-semibold">Cant.</th>
                                        <th className="text-left py-2 px-4 font-semibold">Pago</th>
                                        <th className="text-right py-2 px-4 font-semibold">Costo Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 divide-y divide-gray-100">
                                    {cotizacion.items.map((item, itemIndex) => (
                                        <tr key={itemIndex}>
                                            <td className="text-left py-2 px-4">{item.nombre_producto}</td>
                                            <td className="text-center py-2 px-4">{item.cantidad_solicitada}</td>
                                            <td className="text-left py-2 px-4">{item.modalidad_pago}</td>
                                            <td className="text-right py-2 px-4 font-medium">S/. {item.costo_total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudDetails;