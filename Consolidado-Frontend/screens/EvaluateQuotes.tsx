import React, { useState, useEffect } from 'react';
// Tipos del Backend
import { 
    SolicitudCotizacion, 
    ProveedorBusqueda, 
    DetalleOferta, 
    ItemAdjudicacion, 
    GenerarOrdenCompraRequest 
} from '../interfaces/AbastecimientoTypes';
import { abastecimientoService } from '../services/AbastecimientoService';
import { BackIcon, ChecklistIcon } from '../components/icons/IconsAbastecimiento';

interface EvaluateQuotesProps {
  solicitud: SolicitudCotizacion;
  onCancel: () => void;
  onSuccess: () => void; 
}

// Interfaz visual extendida
interface ItemAdjudicadoVisual extends ItemAdjudicacion {
    nombre_producto: string;
    nombre_proveedor: string;
    pago_ofrecido_original: string; // Guardamos el original para saber qué opciones mostrar
}

const EvaluateQuotes: React.FC<EvaluateQuotesProps> = ({ solicitud, onSuccess, onCancel }) => {
  
  // 1. ESTADOS
  const [providers, setProviders] = useState<ProveedorBusqueda[]>([]);
  const [currentQuoteItems, setCurrentQuoteItems] = useState<DetalleOferta[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | string>('');
  
  // Estado de Selección
  const [adjudicatedMap, setAdjudicatedMap] = useState<Map<number, ItemAdjudicadoVisual>>(new Map());
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 2. CARGAR PROVEEDORES
  useEffect(() => {
    const loadProviders = async () => {
        try {
            setLoading(true);
            const data = await abastecimientoService.getProveedoresCotizantes(solicitud.cod_solicitud);
            setProviders(data);
            if (data.length > 0) {
                setSelectedProviderId(data[0].cod_proveedor);
            }
        } catch (error) {
            console.error("Error cargando proveedores:", error);
        } finally {
            setLoading(false);
        }
    };
    loadProviders();
  }, [solicitud]);

  // 3. CARGAR DETALLES DE OFERTA
  useEffect(() => {
    const loadOffer = async () => {
        if (!selectedProviderId) return;
        try {
            const provId = Number(selectedProviderId);
            const data = await abastecimientoService.getOfertaProveedor(solicitud.cod_solicitud, provId);
            setCurrentQuoteItems(data);
        } catch (error) {
            console.error("Error cargando oferta:", error);
            setCurrentQuoteItems([]);
        }
    };
    loadOffer();
  }, [selectedProviderId, solicitud]);

  // 4. MANEJO DE ADJUDICACIÓN (CHECKBOX)
  const handleAdjudicationChange = (item: DetalleOferta, isChecked: boolean) => {
    const newMap = new Map<number, ItemAdjudicadoVisual>(adjudicatedMap);
    const provId = Number(selectedProviderId);
    const providerName = providers.find(p => p.cod_proveedor === provId)?.nombre_comercial || 'Desconocido';

    if (isChecked) {
        // LÓGICA DE PAGO POR DEFECTO:
        // Si ofrece "Ambos", la OC nace como "Contado" (puedes cambiarlo después).
        // Si ofrece algo específico ("Crédito"), la OC nace obligatoriamente con eso.
        const pagoInicial = item.modalidad_pago === 'Ambos' ? 'Contado' : item.modalidad_pago;

        const newItem: ItemAdjudicadoVisual = {
            cod_producto: item.cod_producto,
            cod_proveedor: provId,
            cantidad_comprada: item.cantidad_solicitada,
            costo_total: item.costo_total,
            modalidad_pago: pagoInicial, 
            nombre_producto: item.nombre_producto,
            nombre_proveedor: providerName,
            pago_ofrecido_original: item.modalidad_pago // Guardamos "Ambos", "Contado" o "Crédito"
        };
        newMap.set(item.cod_producto, newItem);
    } else {
        const currentItem = newMap.get(item.cod_producto);
        if (currentItem && currentItem.cod_proveedor === provId) {
            newMap.delete(item.cod_producto);
        }
    }
    setAdjudicatedMap(newMap);
  };

  // 5. CAMBIO DE PAGO (DROPDOWN EN LA TABLA)
  const handlePaymentMethodChange = (codProducto: number, newMethod: string) => {
      const newMap = new Map<number, ItemAdjudicadoVisual>(adjudicatedMap);
      const currentItem = newMap.get(codProducto);
      
      if (currentItem) {
          const updatedItem: ItemAdjudicadoVisual = { 
              ...currentItem, 
              modalidad_pago: newMethod 
          };
          newMap.set(codProducto, updatedItem);
          setAdjudicatedMap(newMap);
      }
  };

  // Helper para saber qué opciones mostrar en el dropdown
  const getPaymentOptions = (offered: string) => {
      if (offered === 'Ambos') return ['Contado', 'Crédito'];
      return [offered]; // Si ofreció solo "Crédito", solo devolvemos ["Crédito"]
  };

  // 6. GENERAR OCs
  const handleGenerateOCs = async () => {
      if (adjudicatedMap.size === 0) return;

      try {
          setProcessing(true);

          const itemsList: ItemAdjudicadoVisual[] = Array.from(adjudicatedMap.values());

          const itemsAdjudicados: ItemAdjudicacion[] = itemsList.map(ui => ({
              cod_proveedor: ui.cod_proveedor,
              cod_producto: ui.cod_producto,
              cantidad_comprada: ui.cantidad_comprada,
              costo_total: ui.costo_total,
              modalidad_pago: ui.modalidad_pago
          }));

          const payload: GenerarOrdenCompraRequest = {
              cod_solicitud: solicitud.cod_solicitud,
              items_adjudicados: itemsAdjudicados
          };

          await abastecimientoService.generarOrdenesCompra(payload);
          
          alert("Órdenes de Compra generadas exitosamente.");
          onSuccess(); 

      } catch (error) {
          console.error("Error generando órdenes:", error);
          alert("Hubo un error al generar las órdenes.");
      } finally {
          setProcessing(false);
      }
  };

  const allItemsAdjudicated = adjudicatedMap.size === solicitud.total_de_items; 
  
  return (
    <div className="p-4 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6">
        <button onClick={onCancel} className="flex items-center text-sky-700 hover:text-sky-900 font-semibold mr-4">
            <BackIcon className="h-5 w-5 mr-1"/> Volver
        </button>
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Adjudicación de Ítems</h1>
            <p className="text-sm text-gray-500">Para Solicitud de Cotización con código: <span className="font-bold">{String(solicitud.cod_solicitud).padStart(4, '0')}</span></p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- COLUMNA IZQUIERDA: TABLA PRINCIPAL --- */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-sky-700 overflow-hidden shadow-sm min-h-[500px]">
                {/* Header Tabla */}
                <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                    <h2 className="text-xl font-bold text-sky-800">Ítems Ofertados por Proveedor</h2>
                    
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Seleccionar Oferta:</label>
                        <select 
                            value={selectedProviderId} 
                            onChange={e => setSelectedProviderId(Number(e.target.value))}
                            className="border-gray-300 rounded-md text-sm py-1 pl-2 pr-8 focus:ring-sky-500 focus:border-sky-500 bg-gray-800 text-white"
                            disabled={loading}
                        >
                            {providers.map(p => (
                                <option key={p.cod_proveedor} value={p.cod_proveedor}>{p.nombre_comercial}</option>
                            ))}
                            {providers.length === 0 && <option disabled>Sin cotizaciones</option>}
                        </select>
                    </div>
                </div>

                {/* Tabla Azul */}
                <div className="p-4">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-sky-700 text-white">
                                <tr>
                                    <th className="py-3 px-4 w-16 text-center font-bold text-sm">Adjudicar</th>
                                    <th className="text-left py-3 px-4 font-bold text-sm">PRODUCTO</th>
                                    <th className="text-right py-3 px-4 font-bold text-sm">PRECIO OFERTADO</th>
                                    <th className="text-left py-3 px-4 font-bold text-sm">PAGO OFRECIDO</th>
                                    {/* COLUMNA NUEVA PAGO FINAL */}
                                    <th className="text-left py-3 px-4 font-bold text-sm w-40">PAGO FINAL</th> 
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {currentQuoteItems.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-500 italic">{loading ? 'Cargando...' : 'Seleccione un proveedor para ver sus precios.'}</td></tr>
                                ) : (
                                    currentQuoteItems.map((item) => {
                                        const adj = adjudicatedMap.get(item.cod_producto);
                                        const isMyProv = adj?.cod_proveedor === Number(selectedProviderId);
                                        const isOtherProv = adj && !isMyProv;
                                        
                                        // OPCIONES DISPONIBLES: Si es "Ambos" -> [Contado, Crédito], si no -> [Lo que sea]
                                        const opcionesPago = getPaymentOptions(item.modalidad_pago);

                                        return (
                                            <tr key={item.cod_producto} className={`border-b border-gray-100 last:border-0 ${isMyProv ? 'bg-green-50' : isOtherProv ? 'bg-gray-50 opacity-60' : 'hover:bg-sky-50'}`}>
                                                {/* Checkbox */}
                                                <td className="py-3 px-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500 cursor-pointer"
                                                        checked={isMyProv}
                                                        onChange={(e) => handleAdjudicationChange(item, e.target.checked)}
                                                    />
                                                </td>
                                                
                                                {/* Producto */}
                                                <td className="text-left py-3 px-4">
                                                    <div className="font-medium text-gray-800">{item.nombre_producto}</div>
                                                    {isOtherProv && <div className="text-xs text-red-500 mt-0.5">Adjudicado a: {adj?.nombre_proveedor}</div>}
                                                </td>
                                                
                                                {/* Precio */}
                                                <td className="text-right py-3 px-4 font-medium text-gray-700">
                                                    S/. {item.costo_total.toFixed(2)}
                                                </td>
                                                
                                                {/* Pago Ofrecido (Solo lectura) */}
                                                <td className="text-left py-3 px-4 text-sm text-gray-600">
                                                    {item.modalidad_pago}
                                                </td>

                                                {/* PAGO FINAL (Dropdown inteligente) */}
                                                <td className="text-left py-3 px-4">
                                                    <select 
                                                        value={isMyProv ? adj?.modalidad_pago : (item.modalidad_pago === 'Ambos' ? 'Contado' : item.modalidad_pago)}
                                                        onChange={(e) => handlePaymentMethodChange(item.cod_producto, e.target.value)}
                                                        disabled={!isMyProv || opcionesPago.length === 1} // Deshabilitado si no es mío O si solo hay 1 opción
                                                        className={`text-sm border-gray-300 rounded p-1 w-full focus:ring-green-500 focus:border-green-500 ${
                                                            isMyProv ? 'bg-white text-blue-700 font-bold border-blue-300' : 'bg-gray-100 text-gray-400'
                                                        } ${opcionesPago.length === 1 && isMyProv ? 'appearance-none bg-gray-50' : ''}`} // Quitar flecha si solo hay 1 opcion
                                                    >
                                                        {opcionesPago.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        {/* --- COLUMNA DERECHA: RESUMEN --- */}
        <div className="lg:col-span-1">
             <div className="bg-white rounded-lg border border-green-600 shadow-sm p-4 flex flex-col h-full">
                <h2 className="text-lg font-bold text-green-700 border-b border-green-200 pb-2 mb-4">
                    Resumen de Adjudicación
                </h2>
                
                {adjudicatedMap.size === 0 ? (
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-500 italic text-sm text-center px-4">
                            Seleccione los ítems a adjudicar de las ofertas de los proveedores.
                        </p>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar max-h-[500px]">
                        {Array.from(adjudicatedMap.values()).map((adj: ItemAdjudicadoVisual) => (
                            <div key={adj.cod_producto} className="p-3 bg-green-50 rounded-md border border-green-200">
                                <p className="font-bold text-gray-900 text-sm mb-1">{adj.nombre_producto}</p>
                                <div className="text-xs text-gray-600">
                                    {adj.nombre_proveedor} <span className="mx-1">|</span> S/. {adj.costo_total.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Pago Final: <span className="font-bold text-blue-700">{adj.modalidad_pago}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer y Botones */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="text-gray-600 font-medium">Progreso:</span>
                        <span className={`font-bold ${allItemsAdjudicated ? 'text-green-600' : 'text-orange-500'}`}>
                            {adjudicatedMap.size} / {solicitud.total_de_items} ítems
                        </span>
                    </div>
                    
                    {!allItemsAdjudicated && <p className="text-xs text-red-500 mb-3 text-right italic">Debe adjudicar todos los ítems para continuar.</p>}

                    <div className="flex gap-2">
                        <button 
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600 transition text-sm flex items-center"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleGenerateOCs}
                            disabled={!allItemsAdjudicated || processing} 
                            className={`flex-1 flex items-center justify-center text-white font-bold py-2 rounded shadow-sm transition text-sm ${
                                !allItemsAdjudicated || processing 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gray-500 hover:bg-gray-600' 
                            }`}
                        >
                            {processing ? 'Generando...' : 'Generar Órdenes de Compra'} 
                            {!processing && <ChecklistIcon className="ml-2 w-4 h-4"/>}
                        </button>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluateQuotes;