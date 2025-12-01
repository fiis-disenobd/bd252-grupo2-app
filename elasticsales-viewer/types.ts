export interface Sale {
  cod_venta: number;
  fecha_hora_venta: string | null;
  monto_venta: number | null;
}

export interface ElasticSearchHit<T> {
  _index: string;
  _id: string;
  _score: number;
  _source: T;
}

export interface ElasticSearchResponse<T> {
  took: number;
  timed_out: boolean;
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: ElasticSearchHit<T>[];
  };
  error?: {
    type: string;
    reason: string;
  };
}

export interface SearchFilters {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}
