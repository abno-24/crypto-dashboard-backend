export interface CoinGeckoMarketChartResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface CoinGeckoVolResponse {
  market_data: {
    total_volume: {
      usd: number;
    };
  };
}

export interface BlockByTimeResponse {
  status: string;
  message: string;
  result: string; // block number
}

export interface BlockNumberResponse {
  jsonrpc: string;
  id: number;
  result: string; // hex block number
}

export interface TxCountResponse {
  jsonrpc: string;
  id: number;
  result: string; // hex transaction count
}
