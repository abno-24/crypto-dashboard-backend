import pool from "../db/index";
import { fetchBTCData } from "../data-sources/fetchBTCData";
import { fetchETHData } from "../data-sources/fetchETHData";

/**
 * Fetches data for Bitcoin and Ethereum from respective APIs and
 * stores it in the 'crypto_data' table in the database.
 *
 * @returns {Promise<void>}
 */
export async function fetchAndStoreCryptoData() {
  try {
    const results = await Promise.all([fetchBTCData(), fetchETHData()]);

    for (const { coin, volume_usd, transaction_count } of results) {
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
