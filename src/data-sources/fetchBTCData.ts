import axios from "axios";
import pRetry from "p-retry";
import { BlockchainInfoChartResponse } from "../types/blockchainInfo";

/**
 * Fetches the total volume of Bitcoin in USD and the total number of transactions from the
 * Blockchain.com API.
 *
 * @returns {Promise<{ coin: string; volume_usd: number; transaction_count: number; source: string }>} A promise that resolves to an object containing the total volume of Bitcoin in USD and the total number of transactions.
 * @throws {Error} If the API request fails or if invalid data is returned.
 */
export async function fetchBTCData() {
  try {
    console.log("Fetching BTC data from Blockchain API...");

    const [volumeResponse, txResponse] = await Promise.all([
      pRetry(
        () =>
          axios.get<BlockchainInfoChartResponse>(
            "https://api.blockchain.info/charts/trade-volume?timespan=1days&format=json"
          ),
        { retries: 3 }
      ),
      pRetry(
        () =>
          axios.get<BlockchainInfoChartResponse>(
            "https://api.blockchain.info/charts/n-transactions?timespan=1days&format=json"
          ),
        { retries: 3 }
      ),
    ]);

    const volumeData = volumeResponse.data.values;
    const txData = txResponse.data.values;

    if (!volumeData.length || !txData.length) {
      throw new Error("Blockchain.com returned empty data");
    }

    const volumeUsd = volumeData[volumeData.length - 1].y;
    const txCount = txData[txData.length - 1].y;

    console.log("✅ BTC data fetched — Powered by Blockchain.com");

    return {
      coin: "BTC",
      volume_usd: volumeUsd,
      transaction_count: txCount,
      source: "Powered by Blockchain.com",
    };
  } catch (error) {
    console.error("❌ Failed to fetch BTC data:", error);
    throw error;
  }
}
