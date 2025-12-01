import React from 'react';
import { Sale } from '../types';

interface SalesTableProps {
  data: Sale[];
}

const SalesTable: React.FC<SalesTableProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">No sales found matching your criteria.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sale ID (Cod)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((sale) => (
            <tr key={sale.cod_venta} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{sale.cod_venta}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sale.fecha_hora_venta 
                  ? new Date(sale.fecha_hora_venta).toLocaleString() 
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                {sale.monto_venta !== null 
                  ? `$${sale.monto_venta.toFixed(2)}` 
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
