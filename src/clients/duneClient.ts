import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DUNE_BASE_URL = "https://api.dune.com/api/v1";
const DUNE_API_KEY = process.env.DUNE_API_KEY;

if (!DUNE_API_KEY) {
  throw new Error("Missing DUNE_API_KEY in environment variables.");
}

const headers = {
  "x-dune-api-key": DUNE_API_KEY,
  "Content-Type": "application/json",
};

interface ExecuteQueryResponse {
  execution_id: string;
}

type QueryState =
  | "QUERY_STATE_PENDING"
  | "QUERY_STATE_RUNNING"
  | "QUERY_STATE_COMPLETED"
  | "QUERY_STATE_FAILED";

interface DuneResultRow {
  num_tx?: string | number | null;
  total_volume?: string | number | null;
}

interface QueryResultResponse {
  state: QueryState;
  result?: {
    rows: DuneResultRow[];
  };
}

/**
 * Executes a Dune Analytics query and retrieves the result rows.
 *
 * @param {number} queryId - The ID of the Dune query to be executed.
 * @returns {Promise<DuneResultRow[]>} A promise that resolves to an array of result rows.
 * @throws {Error} If the query execution fails, the result state is failed, or polling times out.
 */
async function executeDuneQuery(queryId: number): Promise<DuneResultRow[]> {
  const execRes = await axios.post<ExecuteQueryResponse>(
    `${DUNE_BASE_URL}/query/${queryId}/execute`,
    {},
    { headers }
  );

  const executionId = execRes.data.execution_id;

  const maxAttempts = 10;
  const delayMs = 3000;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const resultRes = await axios.get<QueryResultResponse>(
      `${DUNE_BASE_URL}/execution/${executionId}/results`,
      { headers }
    );

    if (resultRes.data.state === "QUERY_STATE_COMPLETED") {
      return resultRes.data.result?.rows ?? [];
    }

    if (resultRes.data.state === "QUERY_STATE_FAILED") {
      throw new Error(`Dune query (ID: ${queryId}) execution failed.`);
    }

    await new Promise(res => setTimeout(res, delayMs));
  }

  throw new Error(`Dune query (ID: ${queryId}) polling timed out.`);
}

/**
 * Fetches the total volume of Ethereum in USD from Dune.
 *
 * @param {number} queryId - The ID of the Dune query to execute.
 * @returns {Promise<number>} The total volume of Ethereum in USD.
 * @throws {Error} If the API request fails or the response is invalid.
 */
export async function fetchEthUsdVolume(queryId: number): Promise<number> {
  try {
    const rows = await executeDuneQuery(queryId);
    const rawValue = rows[0]?.total_volume;

    const volume =
      typeof rawValue === "string"
        ? parseFloat(rawValue)
        : typeof rawValue === "number"
          ? rawValue
          : null;

    if (volume === null || isNaN(volume)) {
      throw new Error("Invalid or missing volume data from Dune.");
    }

    return volume;
  } catch (error) {
    console.error("Error fetching Ethereum volume:", error);
    throw error;
  }
}

/**
 * Fetches the total number of transactions on the Ethereum blockchain from Dune.
 *
 * @param {number} queryId - The ID of the Dune query to execute.
 * @returns {Promise<number>} The total number of transactions.
 * @throws {Error} If the API request fails or the response is invalid.
 */
export async function fetchEthTransactionCount(
  queryId: number
): Promise<number> {
  try {
    const rows = await executeDuneQuery(queryId);
    const rawValue = rows[0]?.num_tx;

    const count =
      typeof rawValue === "string"
        ? parseInt(rawValue, 10)
        : typeof rawValue === "number"
          ? rawValue
          : null;

    if (count === null || isNaN(count)) {
      throw new Error("Invalid or missing transaction count data from Dune.");
    }

    return count;
  } catch (error) {
    console.error("Error fetching Ethereum transaction count:", error);
    throw error;
  }
}
