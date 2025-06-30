import axios from "axios";
import dotenv from "dotenv";
import {
  BlockByTimeResponse,
  BlockNumberResponse,
  TxCountResponse,
} from "../types/coinGecko";

dotenv.config();

const ETH_API_KEY = process.env.ETH_API_KEY;

if (!ETH_API_KEY) {
  throw new Error("Missing ETH_API_KEY in environment.");
}

const BASE_URL = "https://api.etherscan.io/api";

export async function fetchEthTxCountFromEtherscan(): Promise<number> {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const oneDayAgo = currentTimestamp - 86400;

    // Get block number 24h ago
    const { data: blockData } = await axios.get<BlockByTimeResponse>(BASE_URL, {
      params: {
        module: "block",
        action: "getblocknobytime",
        timestamp: oneDayAgo,
        closest: "before",
        apikey: ETH_API_KEY,
      },
    });

    const startBlock = parseInt(blockData.result, 10);

    // Get latest block number
    const { data: latestBlockData } = await axios.get<BlockNumberResponse>(
      BASE_URL,
      {
        params: {
          module: "proxy",
          action: "eth_blockNumber",
          apikey: ETH_API_KEY,
        },
      }
    );

    const endBlock = parseInt(latestBlockData.result, 16);

    let txCount = 0;
    const BATCH = 5;

    for (let i = startBlock; i <= endBlock; i += BATCH) {
      const batchPromises = Array.from({ length: BATCH }, (_, j) => {
        const blockNumHex = "0x" + (i + j).toString(16);
        return axios
          .get<TxCountResponse>(BASE_URL, {
            params: {
              module: "proxy",
              action: "eth_getBlockTransactionCountByNumber",
              tag: blockNumHex,
              apikey: ETH_API_KEY,
            },
          })
          .then(res => parseInt(res.data.result, 16))
          .catch(() => 0); // skip failed blocks
      });

      const batchCounts = await Promise.all(batchPromises);
      txCount += batchCounts.reduce((a, b) => a + b, 0);
    }

    return txCount;
  } catch (err) {
    console.error("❌ Failed to fetch tx count from Etherscan:", err);
    throw err;
  }
}
