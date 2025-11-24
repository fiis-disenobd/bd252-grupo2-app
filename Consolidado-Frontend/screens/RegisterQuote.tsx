import React, { useState, useMemo, useEffect } from 'react';
// Imports de Tipos Reales
import { 
    SolicitudCotizacion, 
    ProductoParaCotizar, 
    ProveedorBusqueda, 
    RegistrarCotizacionRequest, 
    CotizacionItemRequest 
} from '../interfaces/AbastecimientoTypes';
import { abastecimientoService } from '../services/AbastecimientoService';
import { BackIcon, SaveIcon, CloseIcon, BanIcon, SearchIcon, PlusIcon } from '../components/icons/IconsAbastecimiento';

interface RegisterQuoteProps {
  solicitud: SolicitudCotizacion; 
  providers?: any[]; 
  onSave: () => void; // Se llama cuando decides "Finalizar"
  onCancel: () => void;
}

const RegisterQuote: React.FC<RegisterQuoteProps> = ({ solicitud, onSave, onCancel }) => {
  
  // 1. ESTADOS DE DATOS
  const [itemsToQuote, setItemsToQuote] = useState<ProductoParaCotizar[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Estado para manejar el flujo de éxito
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [lastProviderName, setLastProviderName] = useState('');
  
  // Estado local para excluir proveedores que acabamos de registrar en esta sesión
  // (Porque la prop 'solicitud' no se refresca hasta que salimos)
  const [registeredProviderIds, setRegisteredProviderIds] = useState<Set<number>>(new Set());

  // 2. ESTADOS DEL FORMULARIO
  const [searchTermProvider, setSearchTermProvider] = useState('');
  const [foundProviders, setFoundProviders] = useState<ProveedorBusqueda[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProveedorBusqueda | null>(null);
  const [searchingProv, setSearchingProv] = useState(false);

  // Campos Cabecera
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaGarantia, setFechaGarantia] = useState('');
  const [plazoEntrega, setPlazoEntrega] = useState<string>('');

  // Campos Detalle
  const [itemLineTotals, setItemLineTotals] = useState<Record<number, string>>({});
  // AGREGADO: 'Ambos' como opción válida
  const [itemPaymentMethods, setItemPaymentMethods] = useState<Record<number, 'Contado' | 'Crédito' | 'Ambos'>>({});
  const [notQuotedItems, setNotQuotedItems] = useState<Set<number>>(new Set());

  // 3. CARGAR PRODUCTOS AL INICIAR
  useEffect(() => {
    loadProducts();
  }, [solicitud]);

  const loadProducts = async () => {
    try {
        setLoadingItems(true);
        const data = await abastecimientoService.getProductosParaCotizar(solicitud.cod_solicitud);
        setItemsToQuote(data);
        
        resetFormValues(data);

    } catch (error) {
        console.error("Error cargando productos:", error);
        alert("No se pudieron cargar los productos de la solicitud.");
    } finally {
        setLoadingItems(false);
    }
  };

  // Función auxiliar para resetear valores del formulario (útil para "Registrar Otra")
  const resetFormValues = (items: ProductoParaCotizar[]) => {
    setFechaEmision('');
    setFechaGarantia('');
    setPlazoEntrega('');
    setSearchTermProvider('');
    setSelectedProvider(null);
    setNotQuotedItems(new Set());

    const initialTotals: Record<number, string> = {};
    const initialPayments: Record<number, 'Contado' | 'Crédito' | 'Ambos'> = {};
    items.forEach((item) => {
        initialTotals[item.cod_producto] = '';
        initialPayments[item.cod_producto] = 'Contado';
    });
    setItemLineTotals(initialTotals);
    setItemPaymentMethods(initialPayments);
  };

  // 4. BÚSQUEDA DE PROVEEDORES
  useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
          if (searchTermProvider.length > 2) {
              setSearchingProv(true);
              try {
                  const results = await abastecimientoService.buscarProveedores(searchTermProvider);
                  
                  // FILTRO: Excluir los que ya registramos en esta sesión
                  const filteredResults = results.filter(p => !registeredProviderIds.has(p.cod_proveedor));
                  setFoundProviders(filteredResults);
              } catch (error) {
                  console.error(error);
              } finally {
                  setSearchingProv(false);
              }
          } else {
              setFoundProviders([]);
          }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [searchTermProvider, registeredProviderIds]);

  const handleSelectProvider = (provider: ProveedorBusqueda) => {
      setSelectedProvider(provider);
      setSearchTermProvider('');
      setFoundProviders([]);
  };

  // 5. MANEJADORES DE INPUTS
  const handleLineTotalChange = (codProducto: number, value: string) => {
    setItemLineTotals(prev => ({ ...prev, [codProducto]: value }));
  };

  const handlePaymentMethodChange = (codProducto: number, value: 'Contado' | 'Crédito' | 'Ambos') => {
    setItemPaymentMethods(prev => ({ ...prev, [codProducto]: value }));
  };
  
  const handleToggleNotQuoted = (codProducto: number) => {
    const newNotQuoted = new Set(notQuotedItems);
    if (newNotQuoted.has(codProducto)) {
        newNotQuoted.delete(codProducto);
    } else {
        newNotQuoted.add(codProducto);
        handleLineTotalChange(codProducto, '');
    }
    setNotQuotedItems(newNotQuoted);
  };

  const montoTotalGeneral = useMemo(() => {
    return Object.entries(itemLineTotals).reduce((total, [codStr, val]) => {
      const cod = parseInt(codStr, 10);
      if (notQuotedItems.has(cod)) return total;
      return total + (parseFloat(val as string) || 0);
    }, 0);
  }, [itemLineTotals, notQuotedItems]);

  const isFormValid = useMemo(() => {
    if (!selectedProvider || !fechaEmision || !fechaGarantia || !plazoEntrega) return false;
    
    const itemsWithPrice = itemsToQuote.filter(item => !notQuotedItems.has(item.cod_producto));
    if (itemsWithPrice.length === 0) return false;

    return itemsWithPrice.every(item => {
        const price = parseFloat(itemLineTotals[item.cod_producto] || '0');
        return price > 0;
    });
  }, [selectedProvider, fechaEmision, fechaGarantia, plazoEntrega, itemLineTotals, notQuotedItems, itemsToQuote]);

  // 6. ENVIAR AL BACKEND
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !selectedProvider) return;

    try {
        setSubmitting(true);

        const productosCotizados: CotizacionItemRequest[] = itemsToQuote
            .filter(item => !notQuotedItems.has(item.cod_producto))
            .map(item => ({
                cod_producto: item.cod_producto,
                costo_total: parseFloat(itemLineTotals[item.cod_producto]),
                modalidad_pago: itemPaymentMethods[item.cod_producto]
            }));

        const request: RegistrarCotizacionRequest = {
            cod_solicitud: solicitud.cod_solicitud,
            cod_proveedor: selectedProvider.cod_proveedor,
            fecha_emision_cotizacion: fechaEmision,
            fecha_garantia: fechaGarantia,
            plazo_entrega: parseInt(plazoEntrega, 10),
            monto_total: montoTotalGeneral,
            productosCotizados: productosCotizados
        };

        await abastecimientoService.registrarCotizacion(request);
        
        // ÉXITO: Actualizamos estado local
        setLastProviderName(selectedProvider.nombre_comercial);
        setRegisteredProviderIds(prev => new Set(prev).add(selectedProvider.cod_proveedor)); // Lo añadimos a la lista negra local
        setShowSuccessScreen(true); // Mostramos pantalla de éxito

    } catch (error) {
        console.error("Error al guardar cotización:", error);
        alert("Error al guardar la cotización. Verifique los datos.");
    } finally {
        setSubmitting(false);
    }
  };

  // Lógica para "Registrar Otra"
  const handleRegisterAnother = () => {
      resetFormValues(itemsToQuote);
      setShowSuccessScreen(false);
  };

  // Lógica para "Finalizar"
  const handleFinish = () => {
      onSave(); // Esto llamará a la navegación para volver a la lista
  };

  // --- PANTALLA DE ÉXITO ---
  if (showSuccessScreen) {
      return (
        <div className="p-4 max-w-3xl mx-auto animate-fadeIn h-full flex flex-col justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 text-center max-w-md w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SaveIcon className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cotización Registrada!</h2>
                <p className="text-gray-600 mb-8">
                    Se ha guardado correctamente la cotización de <br/>
                    <span className="font-bold text-sky-700 text-lg">{lastProviderName}</span>.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleRegisterAnother}
                        className="w-full flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-sky-700 transition-colors shadow-md"
                    >
                        <PlusIcon className="w-5 h-5 mr-2"/> Registrar Otra Cotización
                    </button>
                    
                    <button 
                        onClick={handleFinish}
                        className="w-full flex items-center justify-center bg-white border-2 border-gray-300 text-gray-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Finalizar y Volver a Lista
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- PANTALLA DE REGISTRO (FORMULARIO) ---
  return (
    <div className="p-4 max-w-6xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6">
        <button onClick={onCancel} className="flex items-center text-sky-700 font-bold py-2 px-4 rounded-lg hover:bg-sky-100 transition-colors mr-4">
            <BackIcon className="h-5 w-5 mr-2"/>
            Volver
        </button>
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Registrar Cotización</h1>
            <p className="text-md text-gray-500">Solicitud N°: <span className="font-bold">{String(solicitud.cod_solicitud).padStart(4, '0')}</span></p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TARJETA 1: DATOS GENERALES */}
        <div className="bg-white p-6 rounded-lg border-2 border-sky-700 shadow-sm">
            <h2 className="text-xl font-bold text-sky-800 border-b-2 border-sky-200 pb-2 mb-4">Datos de la Oferta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                
                {/* Buscador de Proveedor */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">*Proveedor:</label>
                    
                    {!selectedProvider ? (
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre o RUC..." 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 pl-10 py-2 border"
                                value={searchTermProvider}
                                onChange={e => setSearchTermProvider(e.target.value)}
                            />
                            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            {searchingProv && <div className="absolute right-3 top-2.5 text-xs text-gray-500">Buscando...</div>}
                            
                            {/* Lista de Resultados */}
                            {foundProviders.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {foundProviders.map(prov => (
                                        <li 
                                            key={prov.cod_proveedor} 
                                            onClick={() => handleSelectProvider(prov)}
                                            className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm text-gray-700 border-b last:border-0"
                                        >
                                            <span className="font-bold">{prov.nombre_comercial}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-2 bg-sky-50 border border-sky-200 rounded-md">
                            <span className="font-bold text-sky-800">{selectedProvider.nombre_comercial}</span>
                            <button type="button" onClick={() => setSelectedProvider(null)} className="text-gray-400 hover:text-red-500">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">*Fecha Emisión:</label>
                    <input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 border p-2"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">*Validez / Garantía:</label>
                    <input type="date" value={fechaGarantia} onChange={e => setFechaGarantia(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 border p-2"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">*Plazo Entrega (Días):</label>
                    <input type="number" min="0" placeholder="Ej: 7" value={plazoEntrega} onChange={e => setPlazoEntrega(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 border p-2"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monto Total Calculado:</label>
                    <p className="text-2xl font-bold text-green-700 mt-1">S/. {montoTotalGeneral.toFixed(2)}</p>
                </div>
            </div>
        </div>

        {/* TARJETA 2: TABLA DE PRECIOS */}
        <div className="bg-white p-6 rounded-lg border-2 border-sky-700 shadow-sm relative min-h-[200px]">
            <h2 className="text-xl font-bold text-sky-800 border-b-2 border-sky-200 pb-2 mb-4">Detalle de Precios</h2>
            
            {loadingItems ? (
                <div className="flex justify-center items-center h-32 text-sky-600 animate-pulse">Cargando productos...</div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-sky-700 text-white">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm">Producto</th>
                                <th className="text-center py-3 px-4 text-sm">Cant.</th>
                                <th className="text-left py-3 px-4 text-sm">Unidad</th>
                                <th className="text-left py-3 px-4 text-sm w-48">*Total Línea (S/.)</th>
                                <th className="text-left py-3 px-4 text-sm w-40">*Pago</th>
                                <th className="text-center py-3 px-4 text-sm">Omitir</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {itemsToQuote.map((item) => {
                                const isNotQuoted = notQuotedItems.has(item.cod_producto);
                                const total = parseFloat(itemLineTotals[item.cod_producto] || '0');
                                const unitario = item.cantidad_solicitada > 0 ? total / item.cantidad_solicitada : 0;

                                return (
                                    <tr key={item.cod_producto} className={`border-b border-gray-200 ${isNotQuoted ? 'bg-gray-100' : 'hover:bg-sky-50'}`}>
                                        <td className="py-2 px-4 font-medium">{item.nombre_producto}</td>
                                        <td className="py-2 px-4 text-center">{item.cantidad_solicitada}</td>
                                        <td className="py-2 px-4 text-sm text-gray-500">{item.unidad_medida}</td>
                                        
                                        {/* Input Precio */}
                                        <td className="py-2 px-4">
                                            {isNotQuoted ? (
                                                <span className="text-xs text-gray-400 italic">No cotizado</span>
                                            ) : (
                                                <div>
                                                    <input 
                                                        type="number" step="0.01" min="0"
                                                        value={itemLineTotals[item.cod_producto] || ''}
                                                        onChange={e => handleLineTotalChange(item.cod_producto, e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-right p-1 border"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                    {total > 0 && <div className="text-xs text-gray-500 text-right mt-1">Unit: {unitario.toFixed(2)}</div>}
                                                </div>
                                            )}
                                        </td>

                                        {/* Select Pago */}
                                        <td className="py-2 px-4">
                                            <select 
                                                value={itemPaymentMethods[item.cod_producto]}
                                                onChange={e => handlePaymentMethodChange(item.cod_producto, e.target.value as any)}
                                                disabled={isNotQuoted}
                                                className="w-full border-gray-300 rounded-md shadow-sm text-sm p-1 border disabled:bg-gray-100"
                                            >
                                                <option value="Contado">Contado</option>
                                                <option value="Crédito">Crédito</option>
                                                <option value="Ambos">Ambos</option> {/* Opción Añadida */}
                                            </select>
                                        </td>

                                        {/* Botón Omitir */}
                                        <td className="py-2 px-4 text-center">
                                            <button 
                                                type="button" 
                                                onClick={() => handleToggleNotQuoted(item.cod_producto)}
                                                className={`p-1.5 rounded-full transition-colors ${isNotQuoted ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                                title={isNotQuoted ? "Incluir ítem" : "No cotizar este ítem"}
                                            >
                                                <BanIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* Acciones Finales */}
        <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar <CloseIcon className="ml-2 w-5 h-5"/>
            </button>
            <button 
                type="submit" 
                disabled={!isFormValid || submitting} 
                className={`flex items-center justify-center text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all ${
                    !isFormValid || submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'
                }`}
            >
                {submitting ? 'Guardando...' : 'Guardar Cotización'} 
                {!submitting && <SaveIcon className="ml-2 w-5 h-5"/>}
            </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterQuote;