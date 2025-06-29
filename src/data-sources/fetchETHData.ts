import dotenv from "dotenv";
import {
  fetchEthUsdVolume,
  fetchEthTransactionCount,
} from "../clients/duneClient";

dotenv.config();

const ETH_VOL_QUERY_ID = process.env.ETH_VOL_QUERY_ID;
const ETH_TX_QUERY_ID = process.env.ETH_TX_QUERY_ID;

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
