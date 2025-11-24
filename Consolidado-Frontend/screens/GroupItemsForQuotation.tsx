import React, { useState, useMemo, useEffect } from 'react';
// Importamos los tipos reales del backend
import { ItemPendienteCotizacion, GenerarSolicitudRequest, ItemSeleccionado } from '../interfaces/AbastecimientoTypes';
import { abastecimientoService } from '../services/AbastecimientoService';
import { BackIcon, SaveIcon, CloseIcon } from '../components/icons/IconsAbastecimiento';

interface GroupItemsForQuotationProps {
  // Ya no necesitamos pendingItems como prop, los cargamos dentro
  onGenerate: () => void; // Callback para avisar al padre que refresque
  onCancel: () => void;
}

type SortDirection = 'asc' | 'desc';

const GroupItemsForQuotation: React.FC<GroupItemsForQuotationProps> = ({ onGenerate, onCancel }) => {
  // 1. Estados de Datos
  const [items, setItems] = useState<ItemPendienteCotizacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);

  // 2. Estados de Filtro/Selección
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Identificador único para la selección (cod_pedido + cod_producto)
  const getItemId = (item: ItemPendienteCotizacion) => `${item.cod_pedido}-${item.cod_producto}`;

  // 3. Cargar datos al montar
  useEffect(() => {
    cargarPendientes();
  }, []);

  const cargarPendientes = async () => {
    try {
        setLoading(true);
        // Llamada al servicio real
        const data = await abastecimientoService.getItemsPendientes();
        setItems(data);
    } catch (error) {
        console.error("Error cargando items pendientes:", error);
        alert("Error al cargar la lista de pendientes.");
    } finally {
        setLoading(false);
    }
  };

  const handleSelect = (item: ItemPendienteCotizacion) => {
    const itemId = getItemId(item);
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredAndSortedItems.map(getItemId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedItems = useMemo(() => {
    const parseDate = (dateStr: string) => {
        // Asumimos formato YYYY-MM-DD del backend
        return new Date(dateStr);
    };

    let filtered = items;

    if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0,0,0,0);
        filtered = filtered.filter(item => parseDate(item.fecha_requerida) >= start);
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23,59,59,999);
        filtered = filtered.filter(item => parseDate(item.fecha_requerida) <= end);
    }

    return [...filtered].sort((a, b) => {
      const dateA = parseDate(a.fecha_requerida);
      const dateB = parseDate(b.fecha_requerida);
      if (sortDirection === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [items, sortDirection, startDate, endDate]);

  const handleConfirmGenerate = async () => {
    if (selectedItems.size === 0) return;

    try {
        setProcessing(true);
        
        // Filtramos los objetos completos basados en los IDs seleccionados
        const itemsToProcess = items.filter(i => selectedItems.has(getItemId(i)));
        
        // Mapeamos al formato del Request del Backend
        const requestItems: ItemSeleccionado[] = itemsToProcess.map(i => ({
            cod_pedido: i.cod_pedido,
            cod_producto: i.cod_producto,
            cantidad: i.cantidad_requerida
        }));

        const payload: GenerarSolicitudRequest = {
            cod_usuario: 1, // ID de usuario (puedes ajustarlo si tienes auth context)
            itemsSeleccionados: requestItems
        };

        // Enviamos al backend
        await abastecimientoService.generarSolicitud(payload);
        
        alert("Solicitud generada correctamente.");
        onGenerate(); // Avisar al padre para refrescar lista

    } catch (error) {
        console.error("Error generando solicitud:", error);
        alert("Hubo un error al generar la solicitud.");
    } finally {
        setProcessing(false);
    }
  };
  
  const isSelectAllChecked = selectedItems.size > 0 && selectedItems.size === filteredAndSortedItems.length && filteredAndSortedItems.length > 0;

  if (loading && items.length === 0) {
      return <div className="p-10 text-center text-sky-700 animate-pulse">Cargando ítems pendientes...</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6">
        <button onClick={onCancel} className="flex items-center text-sky-700 font-bold py-2 px-4 rounded-lg hover:bg-sky-100 transition-colors duration-200 mr-4">
            <BackIcon className="h-5 w-5 mr-2"/>
            Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Agrupar Ítems para Cotización</h1>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
        <p className="font-semibold text-gray-700">Filtrar por fecha requerida:</p>
        <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm">Desde:</label>
            <input 
                type="date" 
                id="start-date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2"
            />
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm">Hasta:</label>
            <input 
                type="date" 
                id="end-date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2"
            />
        </div>
        {/* Botón de recarga manual opcional */}
        <button onClick={cargarPendientes} className="ml-auto text-sky-600 hover:underline text-sm">
            Actualizar lista
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
        <table className="min-w-full">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="py-3 px-4 w-12">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  onChange={handleSelectAll}
                  checked={isSelectAllChecked}
                />
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">NOMBRE PRODUCTO</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">PEDIDO ORIGEN</th>
              <th className="text-center py-3 px-4 uppercase font-semibold text-sm">CANTIDAD</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">UNIDAD</th>
              <th 
                className="text-left py-3 px-4 uppercase font-semibold text-sm cursor-pointer hover:bg-sky-800 transition-colors select-none"
                onClick={toggleSortDirection}
              >
                FECHA REQUERIDA {sortDirection === 'asc' ? '▲' : '▼'}
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-200">
            {filteredAndSortedItems.map((item) => {
                const itemId = getItemId(item);
                return (
                    <tr key={itemId} className={`hover:bg-sky-50 transition-colors ${selectedItems.has(itemId) ? 'bg-blue-50' : ''}`}>
                        <td className="py-3 px-4">
                            <input 
                                type="checkbox" 
                                className="form-checkbox h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                checked={selectedItems.has(itemId)}
                                onChange={() => handleSelect(item)}
                            />
                        </td>
                        <td className="text-left py-3 px-4 font-medium text-gray-900">{item.nombre_producto}</td>
                        <td className="text-left py-3 px-4 text-gray-500">
                            {item.cod_pedido}
                        </td>
                        <td className="text-center py-3 px-4 font-bold">{item.cantidad_requerida}</td>
                        <td className="text-left py-3 px-4 text-sm">{item.unidad_medida}</td>
                        <td className="text-left py-3 px-4 text-sm">{item.fecha_requerida}</td>
                    </tr>
                );
            })}
             {filteredAndSortedItems.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500 italic">
                  {items.length === 0 ? "No hay ítems pendientes de cotización." : "No hay coincidencias con los filtros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       <div className="flex justify-between items-center pt-8 pb-4">
            <div className="text-gray-600 font-medium">
                {selectedItems.size} ítem(s) seleccionado(s)
            </div>
            <div className="flex space-x-4">
                <button onClick={onCancel} className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    Cancelar <CloseIcon className="ml-2 w-5 h-5"/>
                </button>
                <button 
                    onClick={handleConfirmGenerate} 
                    disabled={selectedItems.size === 0 || processing} 
                    className={`flex items-center justify-center text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ${
                        selectedItems.size === 0 || processing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-sky-600 hover:bg-sky-700 hover:shadow-lg'
                    }`}
                >
                    {processing ? 'Generando...' : 'Generar Solicitud'} 
                    {!processing && <SaveIcon className="ml-2 w-5 h-5"/>}
                </button>
            </div>
        </div>
    </div>
  );
};

export default GroupItemsForQuotation;