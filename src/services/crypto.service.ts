import axios from "axios";
import pRetry from "p-retry";
import pool from "../db/index";
import dotenv from "dotenv";
import { BlockchainInfoChartResponse } from "../types/blockchainInfo";
import {
  fetchEthUsdVolume,
  fetchEthTransactionCount,
} from "../clients/duneClient";

dotenv.config();

async function fetchBTCData() {
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

async function fetchETHData() {
  try {
    console.log("Fetching ETH data from Dune Analytics...");

    const volume_usd = await fetchEthUsdVolume(
      Number(process.env.DUNE_VOLUME_QUERY_ID)
    );

    const transaction_count = await fetchEthTransactionCount(
      Number(process.env.DUNE_TX_QUERY_ID)
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
