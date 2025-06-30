import axios from "axios";
import { CoinGeckoVolResponse } from "../types/coinGecko";

const COINGECKO_PROXY_URL =
  "https://corsproxy.io/?https://api.coingecko.com/api/v3/coins/ethereum";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins/ethereum";

export async function fetchEthVolumeFromCoinGecko(): Promise<number> {
  try {
    const res = await axios.get<CoinGeckoVolResponse>(COINGECKO_API_URL);

    const volume = res.data.market_data?.total_volume?.usd;

    if (typeof volume !== "number") {
      throw new Error("Invalid volume from CoinGecko");
    }

    return volume;
  } catch (error) {
    console.error("❌ Failed to fetch ETH volume from CoinGecko:", error);
    throw error;
  }
}
