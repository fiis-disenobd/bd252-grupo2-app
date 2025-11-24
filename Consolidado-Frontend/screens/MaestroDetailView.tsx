import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Asegúrate de que las rutas de importación sean correctas según tu estructura
import { UserIcon, RefreshIcon, SortIcon, GiftIcon } from '../components/icons/iconsClientes';
import { clientesService } from '../services/clientesService';
import { MaestroResumen, PerfilMaestro } from '../interfaces/clientesTypes';

// Props del componente principal
interface MaestroDetailViewProps {
  maestro: MaestroResumen; // Usamos el tipo resumen que viene de la lista
  onUpdate: () => void;
  onCanjear: () => void;
}

// Props para la tabla de historial
interface HistoryTableProps {
  data: PerfilMaestro['historialCanjes'];
}

const StatCard: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm ${className}`}>
        <p className="text-2xl font-bold text-blue-600">{value}</p>
        <p className="text-sm text-gray-500 uppercase">{label}</p>
    </div>
);

// Componente de Tabla actualizado para recibir datos reales
const CanjesHistoryTable: React.FC<HistoryTableProps> = ({ data }) => {
    const headers = ['Fecha', 'Premio', 'Cantidad', 'Puntos', 'Estado'];
    
    if (!data || data.length === 0) {
        return <div className="p-4 text-gray-500 text-center bg-white rounded-xl shadow-lg">No hay historial de canjes.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 p-4">Historial de Canjes</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-white uppercase bg-blue-600">
                        <tr>
                            {headers.map(header => (
                                <th key={header} scope="col" className="px-6 py-4 font-bold">
                                    <div className="flex items-center gap-2">
                                        {header}
                                        <SortIcon className="w-4 h-4" />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((canje, index) => (
                            <tr key={index} className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-4">{canje.fecha}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{canje.premio}</td>
                                <td className="px-6 py-4">{canje.cantidad}</td>
                                <td className="px-6 py-4">{canje.puntosGastados}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        canje.estado === 'Entregado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {canje.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const MaestroDetailView: React.FC<MaestroDetailViewProps> = ({ maestro, onUpdate, onCanjear }) => {
  const [perfil, setPerfil] = useState<PerfilMaestro | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
        try {
            setLoading(true);
            // Llamada al backend usando el ID del maestro seleccionado
            const data = await clientesService.getPerfilMaestro(maestro.codPersona);
            setPerfil(data);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la información detallada del maestro.");
        } finally {
            setLoading(false);
        }
    };

    if (maestro.codPersona) {
        fetchPerfil();
    }
  }, [maestro.codPersona]);

  if (loading) return <div className="flex justify-center p-10">Cargando perfil...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;
  if (!perfil) return <div className="p-10">No se encontraron datos.</div>;

  return (
    <div className="flex-grow flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda: Datos Personales */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
                <UserIcon className="w-32 h-32 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">{perfil.nombre}</h2>
                
                <button onClick={onUpdate} className="flex items-center gap-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-slate-800 transition-all my-4">
                    Actualizar Datos
                    <RefreshIcon className="w-5 h-5" />
                </button>
                
                <div className="text-left text-sm text-gray-600 space-y-2 border-t pt-4 w-full">
                    <p><span className="font-semibold">RUC:</span> {perfil.ruc}</p>
                    <p><span className="font-semibold">Teléfono:</span> {perfil.telefono || '-'}</p>
                    <p><span className="font-semibold">Correo:</span> {perfil.correo || '-'}</p>
                    <p><span className="font-semibold">Dirección:</span> {perfil.direccion}</p>
                    <p><span className="font-semibold">Especialidad:</span> {perfil.especialidad}</p>
                    <p><span className="font-semibold">Registro:</span> {perfil.fechaRegistro}</p>
                </div>
            </div>

            {/* Columna Derecha: Estadísticas y Gráfico */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-6">
                    {/* Usamos los datos reales del perfil */}
                    <StatCard label="COMPRAS" value={perfil.comprasTotales} />
                    <StatCard label="GASTADOS" value={`S/ ${perfil.puntosGastados}`} /> {/* Asumiendo relación 1 punto = 1 sol o similar */}
                    <StatCard label="REFERIDOS" value={perfil.referidos} />
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-lg flex-grow">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">Evolución de Canjes</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        {/* dataKey debe coincidir con la interfaz: mes y cantidad */}
                        <LineChart data={perfil.graficoCanjes} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="cantidad" name="Canjes" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Sección Inferior: Resumen Puntos y Botón Canjear */}
        <div className="grid grid-cols-3 gap-6 items-center">
            <StatCard label="CANJES REALIZADOS" value={perfil.historialCanjes.length} />
            <StatCard label="PUNTOS ACTUALES" value={perfil.puntosActuales} className="border-blue-200 bg-blue-50" />
            
            <button onClick={onCanjear} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-all h-full text-lg">
                CANJEAR PUNTOS
                <GiftIcon className="w-6 h-6" />
            </button>
        </div>
        
        {/* Tabla de Historial con datos reales */}
        <div>
            <CanjesHistoryTable data={perfil.historialCanjes} />
        </div>
    </div>
  );
};