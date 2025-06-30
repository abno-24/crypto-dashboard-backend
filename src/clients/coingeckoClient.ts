import axios from "axios";
import { CoinGeckoVolResponse } from "../types/coinGecko";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins/ethereum";

/**
 * Fetches the total volume of Ethereum in USD from CoinGecko.
 *
 * @returns {Promise<number>} The total volume of Ethereum in USD.
 * @throws {Error} If the API request fails or the response is invalid.
 */
export async function fetchEthVolumeFromCoinGecko(): Promise<number> {
  try {
    const res = await axios.get<CoinGeckoVolResponse>(COINGECKO_API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
    });

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
