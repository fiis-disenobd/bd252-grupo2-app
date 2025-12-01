import React, { useState, useEffect } from 'react';
import { Sale, SearchFilters } from './types';
import { searchSales } from './services/esService';
import SalesTable from './components/SalesTable';
import SalesChart from './components/SalesChart';

// Default config
const DEFAULT_ES_URL = 'http://localhost:9200';
const DEFAULT_INDEX = 'venta';

export default function App() {
  // Config State
  const [esUrl, setEsUrl] = useState(DEFAULT_ES_URL);
  const [showConfig, setShowConfig] = useState(false);

  // Data State
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState<SearchFilters>({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
     // Initial load
     fetchData();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchSales(esUrl, DEFAULT_INDEX, filters);
      setSales(results);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(); 
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight">ElasticSales <span className="font-light opacity-80">Explorer</span></h1>
          </div>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 bg-blue-800 hover:bg-blue-700 rounded-md transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Config</span>
          </button>
        </div>
        
        {/* Configuration Panel */}
        {showConfig && (
          <div className="bg-blue-800 border-t border-blue-700 p-4">
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs text-blue-200 mb-1">Elasticsearch URL</label>
                  <input 
                    type="text" 
                    value={esUrl} 
                    onChange={(e) => setEsUrl(e.target.value)} 
                    className="w-full px-3 py-2 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="http://localhost:9200"
                  />
                </div>
                <div className="text-xs text-blue-300 max-w-lg">
                  <p>Ensure your <code>elasticsearch.yml</code> has:</p>
                  <code className="block bg-blue-900 p-1 mt-1 rounded">http.cors.enabled: true</code>
                  <code className="block bg-blue-900 p-1 mt-0.5 rounded">http.cors.allow-origin: "*"</code>
                </div>
             </div>
          </div>
        )}
      </header>

      <main className="flex-grow bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Filter Sales
            </h2>

            {/* Manual Filters */}
            <form onSubmit={handleManualSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleManualFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input 
                    type="date" 
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleManualFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min Amount</label>
                  <input 
                    type="number" 
                    name="minAmount"
                    placeholder="0.00"
                    value={filters.minAmount}
                    onChange={handleManualFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Amount</label>
                  <input 
                    type="number" 
                    name="maxAmount"
                    placeholder="10000.00"
                    value={filters.maxAmount}
                    onChange={handleManualFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                  />
               </div>
               <button 
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={loading}
               >
                 Search
               </button>
            </form>
          </div>

          {/* Feedback & Content */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Retrieving sales data...</p>
             </div>
          ) : (
            <>
               <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">
                    Results <span className="text-gray-400 font-normal">({sales.length} records)</span>
                  </h2>
               </div>
               
               {/* Charts */}
               <SalesChart data={sales} />

               {/* Data Table */}
               <SalesTable data={sales} />
            </>
          )}

        </div>
      </main>
    </div>
  );
}