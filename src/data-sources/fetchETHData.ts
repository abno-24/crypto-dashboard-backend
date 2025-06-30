import dotenv from "dotenv";
import {
  fetchEthUsdVolume,
  fetchEthTransactionCount,
} from "../clients/duneClient";
import { fetchEthVolumeFromCoinGecko } from "../clients/coingeckoClient";
import { fetchEthTxCountFromEtherscan } from "../clients/etherscanClient";

dotenv.config();

const ETH_VOL_QUERY_ID = process.env.ETH_VOL_QUERY_ID;
const ETH_TX_QUERY_ID = process.env.ETH_TX_QUERY_ID;

/**
 * Fetches the total volume of Ethereum in USD and the total number of transactions from Dune Analytics.
 *
 * If the Dune query fails, falls back to fetching the volume from CoinGecko and the transaction count from Etherscan.
 *
 * @returns {Promise<{ coin: string; volume_usd: number; transaction_count: number; source: string }>} A promise that resolves to an object containing the total volume of Ethereum in USD, the total number of transactions, and the source of the data.
 * @throws {Error} If both the Dune and fallback queries fail.
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
  } catch (duneError) {
    console.warn("⚠️ Dune failed, falling back to CoinGecko + Etherscan");

    try {
      const volume_usd = await fetchEthVolumeFromCoinGecko();
      const transaction_count = await fetchEthTxCountFromEtherscan();

      console.log("✅ ETH fallback data fetched — CoinGecko + Etherscan");

      return {
        coin: "ETH",
        volume_usd,
        transaction_count,
        source: "Fallback (CoinGecko + Etherscan)",
      };
    } catch (fallbackError) {
      console.error("❌ ETH fallback failed:", fallbackError);
      throw new Error("Failed to fetch ETH data from both sources");
    }
  }
}
