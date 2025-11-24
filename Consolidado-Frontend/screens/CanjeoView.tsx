import React, { useState, useEffect, useMemo } from 'react';
import { clientesService } from '../services/clientesService';
import { MaestroResumen, InfoPantallaCanje, PremioCatalogo, NuevoCanjeRequest } from '../interfaces/clientesTypes';
import { GiftIcon, AddIcon, TrashIcon, CloseIcon, CheckIcon } from '../components/icons/iconsClientes';
import { AnadirPremioModal } from './AnadirPremioModal';

interface CanjeoViewProps {
  maestro: MaestroResumen;
  onBack: () => void;
}

export type SelectedPremio = PremioCatalogo & { cantidad: number };

export const CanjeoView: React.FC<CanjeoViewProps> = ({ maestro, onBack }) => {
  const [info, setInfo] = useState<InfoPantallaCanje | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPremios, setSelectedPremios] = useState<SelectedPremio[]>([]);
  
  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const COD_USUARIO_ACTUAL = 1; 

  // 1. Cargar información
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        // Nota: Para leer la info de cabecera (puntos, etc) seguimos usando codPersona
        // porque tu endpoint GET probablemente lo busca así.
        const data = await clientesService.getInfoPantallaCanje(COD_USUARIO_ACTUAL, maestro.codPersona);
        setInfo(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar la información del maestro.");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [maestro.codPersona]);

  // 2. Cálculos Dinámicos
  const puntosDisponibles = useMemo(() => {
      return Number(info?.puntosDisponibles || 0);
  }, [info]);

  const puntosGastados = useMemo(() => {
      return selectedPremios.reduce((acc, p) => acc + (Number(p.costo) * Number(p.cantidad)), 0);
  }, [selectedPremios]);

  const nuevoTotal = Number((puntosDisponibles - puntosGastados).toFixed(2));
  const esSaldoInsuficiente = nuevoTotal < 0;

  const headers = ['PREMIO', 'DESCRIPCIÓN', 'CANTIDAD', 'COSTO UNITARIO', 'MONTO', ''];

  // Manejadores
  const handleRemovePremio = (id: number) => {
    setSelectedPremios(premios => premios.filter(p => p.id !== id));
  };
  
  const handleAddPremios = (nuevosPremios: SelectedPremio[]) => {
      const updatedPremios = [...selectedPremios];
      nuevosPremios.forEach(newPremio => {
          const existingIndex = updatedPremios.findIndex(p => p.id === newPremio.id);
          if (existingIndex > -1) {
              updatedPremios[existingIndex].cantidad += newPremio.cantidad;
          } else {
              updatedPremios.push(newPremio);
          }
      });
      setSelectedPremios(updatedPremios);
      setIsModalOpen(false);
  };

  const handleProcesarCanje = async () => {
    if (selectedPremios.length === 0) {
        alert("Debes seleccionar al menos un premio.");
        return;
    }
    
    if (esSaldoInsuficiente) {
        alert(`Saldo insuficiente. Tienes ${puntosDisponibles} y intentas gastar ${puntosGastados}.`);
        return;
    }

    try {
        // --- ENVÍO CORRECTO ---
        // Ahora que corregiste el Java DTO, maestro.codMaestro SÍ tiene valor (ej: 6).
        // Ya no necesitamos enviar codPersona.
        
        // Pequeña seguridad: si por alguna razón el backend falla y manda null, lanzamos error visible.
        if (!maestro.codMaestro) {
            throw new Error("Error de datos: El backend no envió el código de maestro.");
        }

        const payload: NuevoCanjeRequest = {
            codMaestro: maestro.codMaestro, // Enviamos el ID correcto (6)
            codUsuario: COD_USUARIO_ACTUAL,
            montoTotal: puntosGastados,
            items: selectedPremios.map(p => ({
                codPremio: p.id,
                cantidad: p.cantidad
            }))
        };

        await clientesService.registrarCanje(payload);
        setShowSuccess(true); 
    } catch (error: any) {
        console.error("Error en canje:", error);
        const msj = error.response?.data?.message || error.message || "Error desconocido";
        alert("Error al procesar el canje: " + msj);
    }
  };
  
  if (loading) return <div className="p-10 text-center flex items-center justify-center h-full"><span className="text-xl text-gray-500 animate-pulse">Cargando información...</span></div>;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg relative text-gray-900 h-full flex flex-col animate-fadeIn">
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
             <GiftIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
             <h2 className="text-3xl font-bold text-gray-800">Canjeo de Premios</h2>
             <p className="text-gray-500 text-sm">Gestiona el intercambio de puntos</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500 bg-gray-50 p-2 rounded border">
          <p className="font-bold text-gray-700">Fecha Servidor</p>
          <p>{info?.fechaServidor}</p>
        </div>
      </div>

      {/* Datos Informativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-500 uppercase font-bold mb-1">Maestro Beneficiario</p>
            <p className="text-lg font-semibold text-gray-800">{info?.nombreMaestro}</p>
            <div className="flex gap-3 text-sm text-gray-600">
                 <span>ID Persona: {maestro.codPersona}</span>
                 <span className="font-bold text-blue-700">ID Maestro: {maestro.codMaestro}</span>
            </div>
         </div>
         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Operador Responsable</p>
            <p className="text-lg font-semibold text-gray-800">{info?.nombreOperador}</p>
            <p className="text-sm text-gray-600">{info?.rolOperador}</p>
         </div>
      </div>

      {/* Tabla de Productos Seleccionados */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-700">Carrito de Premios</h3>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{selectedPremios.length} items</span>
      </div>

      <div className="border rounded-lg overflow-hidden mb-6 flex-grow overflow-y-auto shadow-inner bg-gray-50">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-white sticky top-0 z-10">
            <tr>{headers.map(h => <th key={h} className="px-4 py-3 text-left font-bold tracking-wider text-xs">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {selectedPremios.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 flex flex-col items-center justify-center">
                        <GiftIcon className="w-12 h-12 mb-2 opacity-20" />
                        <span>El carrito está vacío. Añade premios para comenzar.</span>
                    </td>
                </tr>
            ) : (
                selectedPremios.map(p => (
                <tr key={p.id} className="text-black hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs text-xs">{p.descripcion}</td>
                    <td className="px-4 py-3 font-mono">{p.cantidad}</td>
                    <td className="px-4 py-3 font-mono">{Number(p.costo).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-blue-700 font-mono">{(p.costo * p.cantidad).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                    <button onClick={() => handleRemovePremio(p.id)} className="text-red-400 p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors" title="Eliminar">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Totales y Botones */}
      <div className="grid grid-cols-12 gap-6 mt-auto pt-4 border-t border-gray-200">
        
        {/* Botón Añadir y Resumen de Puntos */}
        <div className="col-span-7 flex flex-col justify-between">
            <div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-orange-500 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-orange-600 active:scale-95 transition-all">
                    <AddIcon className="w-5 h-5"/> AGREGAR PREMIO
                </button>
            </div>
            
            {/* Resumen visual de la resta */}
            <div className="mt-4 flex items-center gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 w-fit">
                <div className="text-center">
                    <span className="block text-gray-500 text-xs font-bold uppercase">Disponibles</span>
                    <span className="font-mono text-lg font-bold text-slate-700">{puntosDisponibles.toFixed(2)}</span>
                </div>
                <div className="text-gray-400 text-xl font-bold">-</div>
                <div className="text-center">
                    <span className="block text-gray-500 text-xs font-bold uppercase">A gastar</span>
                    <span className="font-mono text-lg font-bold text-red-600">{puntosGastados.toFixed(2)}</span>
                </div>
                <div className="text-gray-400 text-xl font-bold">=</div>
                <div className="text-center">
                    <span className="block text-gray-500 text-xs font-bold uppercase">Saldo Final</span>
                    <span className={`font-mono text-lg font-bold px-2 rounded ${esSaldoInsuficiente ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {nuevoTotal.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>

        {/* Botones de Acción */}
        <div className="col-span-5 flex flex-col gap-3">
          <div className="bg-slate-800 text-white p-4 rounded-xl shadow-md flex justify-between items-center">
            <span className="text-slate-300 font-medium">Total a Canjear:</span>
            <span className="text-3xl font-bold tracking-tight">{puntosGastados.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
              <button onClick={onBack} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                CANCELAR
              </button>
              
              <button 
                onClick={handleProcesarCanje}
                disabled={esSaldoInsuficiente || selectedPremios.length === 0}
                className={`w-full font-bold py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all ${
                    esSaldoInsuficiente || selectedPremios.length === 0 
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                }`}
              >
                CONFIRMAR <CheckIcon className="w-5 h-5"/>
              </button>
          </div>
        </div>
      </div>
      
      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="absolute inset-0 bg-emerald-600/95 z-50 flex flex-col justify-center items-center rounded-lg backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-6 rounded-full shadow-2xl mb-6 animate-bounce">
            <CheckIcon className="w-20 h-20 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-wide mb-2">¡CANJE REGISTRADO!</h2>
          <p className="text-emerald-100 text-lg mb-8 text-center max-w-md">
              Se han descontado <span className="font-bold text-white">{puntosGastados.toFixed(2)}</span> puntos del saldo del maestro.
          </p>
          <button onClick={onBack} className="bg-white text-emerald-700 font-bold py-3 px-10 rounded-full shadow-lg hover:bg-emerald-50 hover:scale-105 transition-all text-lg">
            Volver al Perfil
          </button>
        </div>
      )}

      {/* Modal para Añadir Premios (Catálogo) */}
      <AnadirPremioModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddPremios={handleAddPremios} 
      />
    </div>
  );
};  