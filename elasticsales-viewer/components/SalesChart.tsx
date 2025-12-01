import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Sale } from '../types';

interface SalesChartProps {
  data: Sale[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    // Group by date (YYYY-MM-DD)
    const groups: Record<string, number> = {};
    
    data.forEach((sale) => {
      if (!sale.fecha_hora_venta || !sale.monto_venta) return;
      // Extract YYYY-MM-DD
      const dateKey = sale.fecha_hora_venta.split('T')[0];
      groups[dateKey] = (groups[dateKey] || 0) + sale.monto_venta;
    });

    // Convert to array and sort
    return Object.entries(groups)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-white rounded-lg border border-gray-200">
        No Data to Visualize
      </div>
    );
  }

  return (
    <div className="h-80 w-full bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">Total Sales Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => value.slice(5)} // Show MM-DD
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Sold']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
