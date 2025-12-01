import { ElasticSearchResponse, Sale, SearchFilters } from '../types';

export const searchSales = async (
  baseUrl: string,
  indexName: string,
  filters: SearchFilters
): Promise<Sale[]> => {
  const url = `${baseUrl}/${indexName}/_search`;

  // Build Query from manual filters
  const mustConditions = [];

  // Date Range
  if (filters.startDate || filters.endDate) {
    const range: any = { fecha_hora_venta: {} };
    if (filters.startDate) range.fecha_hora_venta.gte = filters.startDate;
    if (filters.endDate) range.fecha_hora_venta.lte = filters.endDate;
    mustConditions.push({ range });
  }

  // Amount Range
  if (filters.minAmount || filters.maxAmount) {
    const range: any = { monto_venta: {} };
    if (filters.minAmount) range.monto_venta.gte = parseFloat(filters.minAmount);
    if (filters.maxAmount) range.monto_venta.lte = parseFloat(filters.maxAmount);
    mustConditions.push({ range });
  }

  let query: any = {
    match_all: {},
  };

  if (mustConditions.length > 0) {
    query = {
      bool: {
        must: mustConditions,
      },
    };
  }

  const body = {
    size: 1000, // Limit to 1000 for performance
    sort: [{ fecha_hora_venta: { order: 'desc' } }],
    query: query,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Elasticsearch Error (${response.status}): ${errText}`);
    }

    const data: ElasticSearchResponse<Sale> = await response.json();
    
    if (data.error) {
        throw new Error(`Elasticsearch Query Error: ${data.error.reason}`);
    }

    return data.hits.hits.map((hit) => hit._source);
  } catch (error: any) {
    // Detect typical CORS error or Network error
    if (error.message.includes('Failed to fetch')) {
        throw new Error("Network Error: Could not connect to Elasticsearch. Please check if your ES is running at the configured URL and if CORS is enabled (http.cors.enabled: true in elasticsearch.yml).");
    }
    throw error;
  }
};