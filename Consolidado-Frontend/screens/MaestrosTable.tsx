import React, { useEffect, useState } from 'react';
import { SortIcon } from '../components/icons/iconsClientes';
// 1. Importamos el servicio y la interfaz correcta
import { clientesService } from '../services/clientesService';
import { MaestroResumen } from '../interfaces/clientesTypes';

const headers = [
  'NOMBRE',
  'RUC',
  'DISTRITO',
  'TELÉFONO',
  'CORREO',
  'ESPECIALIDAD',
  'FECHA REGISTRO',
];

interface MaestrosTableProps {
  // 2. Actualizamos el tipo para que el padre reciba el objeto real con codPersona
  onMaestroSelect: (maestro: MaestroResumen) => void;
}

export const MaestrosTable: React.FC<MaestrosTableProps> = ({ onMaestroSelect }) => {
  // 3. Estado para guardar los datos reales de la BD
  const [maestros, setMaestros] = useState<MaestroResumen[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 4. Efecto para cargar los datos al montar el componente
  useEffect(() => {
    const fetchMaestros = async () => {
      try {
        setLoading(true);
        const data = await clientesService.getMaestrosResumen();
        setMaestros(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la lista de maestros.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaestros();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando lista de maestros...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="overflow-auto flex-grow h-full">
        <table className="w-full text-sm text-left text-gray-600 relative">
          <thead className="text-xs text-white uppercase bg-blue-600 sticky top-0 z-10">
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
            {/* 5. Mapeamos los datos reales (maestros) en lugar de la constante */}
            {maestros.map((maestro) => (
              <tr 
                key={maestro.codPersona} // Usamos codPersona como llave única
                className="bg-white hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onMaestroSelect(maestro)}
              >
                {/* Nota: En la vista SQL, 'nombre' ya suele venir completo o concatenado */}
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {maestro.nombre}
                </td>
                <td className="px-6 py-4">{maestro.ruc}</td>
                <td className="px-6 py-4">{maestro.distrito}</td>
                <td className="px-6 py-4">{maestro.telefono}</td>
                <td className="px-6 py-4">{maestro.correo}</td>
                <td className="px-6 py-4">{maestro.especialidad}</td>
                <td className="px-6 py-4">{maestro.fechaRegistro}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {maestros.length === 0 && (
            <div className="p-10 text-center text-gray-400">No se encontraron maestros registrados.</div>
        )}
      </div>
    </div>
  );
};