import { Request, Response } from "express";
import pool from "../db/index";

interface CryptoData {
  id: number;
  coin: string;
  volume_usd: number;
  transaction_count: number;
  timestamp: string;
}

const coinMap: { [key: string]: string } = {
  bitcoin: "BTC",
  btc: "BTC",
  ethereum: "ETH",
  eth: "ETH",
};

/**
 * Handles a GET request to /crypto/volume-and-transactions.
 * Returns crypto data for the past 24 hours for the given coin(s) in the query parameter.
 *
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 * @throws {Error} If the query execution fails or if invalid coin names are provided.
 */
export async function getVolumeAndTransactions(req: Request, res: Response) {
  try {
    const { coin } = req.query;
    let query =
      "SELECT * FROM crypto_data WHERE timestamp >= NOW() - INTERVAL '24 hours'";
    const values: string[] = [];

    if (coin && typeof coin === "string") {
      const inputCoins = coin.split(",").map(c => c.toLowerCase().trim());
      const mappedCoins = inputCoins
        .map(c => coinMap[c])
        .filter(c => c !== undefined);

      if (mappedCoins.length === 0) {
        return res.status(400).json({ error: "Invalid coin names provided" });
      }

      query += " AND coin = ANY($1)";
      values.push(`{${mappedCoins.join(",")}}`);
    }

    const result = await pool.query<CryptoData>(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
