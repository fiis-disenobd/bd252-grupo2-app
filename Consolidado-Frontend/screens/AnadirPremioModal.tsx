import React, { useState, useMemo, useEffect } from 'react';
import { CloseIcon, SearchIcon, AddIcon, TrashIcon, SortIcon } from '../components/icons/iconsClientes';
import { clientesService } from '../services/clientesService';
import { PremioCatalogo } from '../interfaces/clientesTypes';
import { SelectedPremio } from '../screens/CanjeoView';

interface AnadirPremioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPremios: (premios: SelectedPremio[]) => void;
}

export const AnadirPremioModal: React.FC<AnadirPremioModalProps> = ({ isOpen, onClose, onAddPremios }) => {
  // Estado para o catálogo que vén da Base de Datos
  const [catalog, setCatalog] = useState<PremioCatalogo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Estado para a selección local dentro do modal
  const [selectedPremios, setSelectedPremios] = useState<SelectedPremio[]>([]);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});

  // 1. Cargar o catálogo cando se abre o modal
  useEffect(() => {
    if (isOpen) {
        cargarCatalogo();
    }
  }, [isOpen]);

  const cargarCatalogo = async (filtro: string = "") => {
      try {
          setLoading(true);
          const data = await clientesService.getCatalogoPremios(filtro);
          setCatalog(data);
      } catch (error) {
          console.error("Erro ao cargar catálogo:", error);
      } finally {
          setLoading(false);
      }
  };

  // Manexar a busca
  const handleSearch = () => {
      cargarCatalogo(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleSearch();
      }
  };

  // Calcular total de puntos seleccionados
  const totalPoints = useMemo(() => {
    return selectedPremios.reduce((total, p) => total + (p.costo * p.cantidad), 0);
  }, [selectedPremios]);

  if (!isOpen) return null;

  // Lóxica para engadir do catálogo á lista da dereita
  const handleAddClick = (premio: PremioCatalogo) => {
    const cantidad = quantities[premio.id] || 1;
    if(cantidad <= 0) return;

    setSelectedPremios(prev => {
        const existing = prev.find(p => p.id === premio.id);
        if (existing) {
            return prev.map(p => p.id === premio.id ? { ...p, cantidad: p.cantidad + cantidad } : p);
        }
        return [...prev, { ...premio, cantidad }];
    });
  };

  // Lóxica para eliminar da lista da dereita
  const handleRemoveFromSelected = (premioId: number) => {
    setSelectedPremios(prev => prev.filter(p => p.id !== premioId));
  }

  // Confirmar e pasar datos ao pai
  const handleConfirm = () => {
    onAddPremios(selectedPremios);
    handleCancel(); // Limpa e pecha
  };

  const handleCancel = () => {
    setSelectedPremios([]);
    setQuantities({});
    setSearchTerm("");
    onClose();
  };
  
  const catalogHeaders = ['NOMBRE', 'DESCRIPCIÓN', 'COSTO', 'CATEGORÍA', 'CANT.', 'AÑADIR'];
  const selectedHeaders = ['PREMIO', 'CANT.', 'COSTO', 'SUBTOTAL', ''];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      {/* Usamos flex flex-col y max-h-[90vh] para asegurar estructura */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] max-h-[90vh] flex flex-col relative animate-fadeIn overflow-hidden">
        
        {/* Cabeceira */}
        <div className="flex-none flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Añadir Premios</h2>
                <p className="text-sm text-gray-500">Selecciona os produtos do catálogo</p>
            </div>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        
        {/* Corpo Principal - Grid Responsivo */}
        {/* min-h-0 es crucial aquí para que el scroll funcione dentro de flex items anidados */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-grow min-h-0">
            
            {/* Columna Esquerda: Catálogo (BD) */}
            <div className="col-span-1 lg:col-span-7 flex flex-col h-full border-r border-gray-200 p-4 lg:p-6 min-h-0">
                
                {/* Barra de Busca */}
                <div className="flex-none flex gap-2 mb-4">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="Buscar premio..." 
                            className="border border-gray-300 bg-white h-10 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button 
                            onClick={handleSearch}
                            className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-blue-600"
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Táboa Catálogo - Scrollable */}
                <div className="flex-grow overflow-y-auto border rounded-lg relative min-h-0">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-20">
                            <span className="text-blue-600 font-semibold">Cargando catálogo...</span>
                        </div>
                    )}
                    
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white uppercase bg-blue-600 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {catalogHeaders.map(h => (
                                    <th key={h} className="px-4 py-3 font-semibold tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {catalog.length === 0 && !loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Non se atoparon premios.</td></tr>
                            ) : (
                                catalog.map(p => (
                                    <tr key={p.id} className="hover:bg-blue-50 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[150px]" title={p.descripcion}>{p.descripcion}</td>
                                        <td className="px-4 py-3 text-blue-600 font-bold">{p.costo}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            <span className="bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">{p.categoria}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number" 
                                                min="1" 
                                                max={p.stock}
                                                defaultValue="1" 
                                                onChange={(e) => setQuantities({...quantities, [p.id]: parseInt(e.target.value, 10) || 1})} 
                                                className="w-16 border border-gray-300 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500" 
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => handleAddClick(p)} 
                                                disabled={p.stock <= 0}
                                                className={`p-1.5 rounded-md transition-all shadow-sm ${p.stock > 0 ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-110' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                <AddIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Columna Dereita: Selección */}
            <div className="col-span-1 lg:col-span-5 flex flex-col h-full bg-gray-50 p-4 lg:p-6 min-h-0 border-t lg:border-t-0 lg:border-l border-gray-200">
                <div className="flex-none flex justify-between items-end mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Seleccionados ({selectedPremios.length})</h3>
                    {selectedPremios.length > 0 && (
                        <button onClick={() => setSelectedPremios([])} className="text-xs text-red-500 hover:underline">
                            Limpar todo
                        </button>
                    )}
                </div>
                
                {/* Tabla de Seleccionados - Scrollable */}
                <div className="flex-grow overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-4 min-h-0">
                   <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0 z-10 border-b">
                        <tr>
                            {selectedHeaders.map(h => <th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {selectedPremios.length > 0 ? selectedPremios.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-800">{p.nombre}</td>
                                <td className="px-3 py-2 text-center text-gray-600">{p.cantidad}</td>
                                <td className="px-3 py-2 text-center text-gray-600">{p.costo}</td>
                                <td className="px-3 py-2 text-center font-bold text-blue-600">{p.costo * p.cantidad}</td>
                                <td className="px-3 py-2 text-center">
                                    <button onClick={() => handleRemoveFromSelected(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                                <td colSpan={5} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <SearchIcon className="w-12 h-12 mb-2 opacity-20" />
                                        <span>Engade premios desde o catálogo</span>
                                    </div>
                                </td>
                           </tr> 
                        )}
                    </tbody>
                    </table>
                </div>

                {/* Pé do Modal - Fixed at bottom of column */}
                <div className="flex-none bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">Total Puntos:</span>
                        <span className="text-3xl font-bold text-blue-700">{totalPoints}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleConfirm} disabled={selectedPremios.length === 0} className={`font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${selectedPremios.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                            CONFIRMAR <SortIcon className="w-4 h-4 rotate-90" />
                        </button>
                        <button onClick={handleCancel} className="bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                            CANCELAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};