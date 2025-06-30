import pool from "../db/index";
import { fetchBTCData } from "../data-sources/fetchBTCData";
import { fetchETHData } from "../data-sources/fetchETHData";

/**
 * Fetches and stores the current volume and transaction count for both Bitcoin and Ethereum in the database.
 * This function is intended to be called at regular intervals by a scheduler.
 * @throws {Error} If the API request fails or the response is invalid.
 */
export async function fetchAndStoreCryptoData() {
  try {
    const results = await Promise.all([fetchBTCData(), fetchETHData()]);

    for (const { coin, volume_usd, transaction_count } of results) {
      if (
        typeof volume_usd !== "number" ||
        typeof transaction_count !== "number" ||
        isNaN(volume_usd) ||
        isNaN(transaction_count)
      ) {
        console.error(`❌ Skipping ${coin} due to invalid data:`, {
          volume_usd,
          transaction_count,
        });
        continue; // Skip this iteration
      }

      await pool.query(
        `INSERT INTO crypto_data (coin, volume_usd, transaction_count) VALUES ($1, $2, $3)`,
        [coin, volume_usd, transaction_count]
      );
      console.log(
        `📦 Stored ${coin}: volume = $${volume_usd}, txs = ${transaction_count}`
      );
    }
  } catch (error) {
    console.error("🚨 Error fetching/storing crypto data:", error);
  }
}
