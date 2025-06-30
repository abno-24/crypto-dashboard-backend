import dotenv from "dotenv";
import {
  fetchEthUsdVolume,
  fetchEthTransactionCount,
} from "../clients/duneClient";

dotenv.config();

const ETH_VOL_QUERY_ID = process.env.ETH_VOL_QUERY_ID;
const ETH_TX_QUERY_ID = process.env.ETH_TX_QUERY_ID;

/**
 * Fetches data for Ethereum from Dune Analytics and returns an object with the
 * volume (in USD) and transaction count.
 *
 * @returns {Promise<{ coin: string; volume_usd: number; transaction_count: number; source: string }>} A promise that resolves to an object containing the fetched data.
 * @throws If the API calls fail or if the data is invalid or missing.
 */
export async function fetchETHData() {
  try {
    console.log("Fetching ETH data from Dune Analytics...");

    const volume_usd = await fetchEthUsdVolume(Number(ETH_VOL_QUERY_ID));

    const transaction_count = await fetchEthTransactionCount(
      Number(ETH_TX_QUERY_ID)
    );

    console.log("✅ ETH data fetched - Powered by Dune Analytics");

    return {
      coin: "ETH",
      volume_usd,
      transaction_count,
      source: "Dune Analytics",
    };
  } catch (error) {
    console.error("❌ Failed to fetch ETH data:", error);
    throw error;
  }
}
