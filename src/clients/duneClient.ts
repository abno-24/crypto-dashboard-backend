import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DUNE_BASE_URL = "https://api.dune.com/api/v1";
const DUNE_API_KEY = process.env.DUNE_API_KEY;

const headers = {
  "x-dune-api-key": DUNE_API_KEY,
  "Content-Type": "application/json",
};

interface ExecuteQueryResponse {
  execution_id: string;
}

interface QueryResultRow {
  [key: string]: string | number | null;
}

interface QueryResultResponse {
  state: "QUERY_STATE_COMPLETED" | "QUERY_STATE_PENDING" | "QUERY_STATE_FAILED";
  result?: {
    rows: QueryResultRow[];
  };
}

export async function fetchDuneVolume(queryId: number): Promise<number> {
  try {
    const execRes = await axios.post<ExecuteQueryResponse>(
      `${DUNE_BASE_URL}/query/${queryId}/execute`,
      {},
      { headers }
    );

    const executionId = execRes.data.execution_id;

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const resultRes = await axios.get<QueryResultResponse>(
        `${DUNE_BASE_URL}/execution/${executionId}/results`,
        { headers }
      );

      if (
        resultRes.data.state === "QUERY_STATE_COMPLETED" &&
        resultRes.data.result?.rows
      ) {
        const firstRow = resultRes.data.result.rows[0];
        const volumeRaw = (firstRow as any)["total_volume"];
        const volume = parseFloat(volumeRaw?.toString() || "0");
        return isNaN(volume) ? 0 : volume;
      } else if (resultRes.data.state === "QUERY_STATE_FAILED") {
        throw new Error("Volume query failed");
      }

      await new Promise(res => setTimeout(res, 3000));
      attempts++;
    }

    throw new Error("Volume query polling timed out");
  } catch (error) {
    console.error("Error fetching Ethereum volume from Dune:", error);
    throw error;
  }
}

export async function fetchDuneQueryResult(queryId: number): Promise<number> {
  try {
    // Step 1: Execute the query
    const execRes = await axios.post<ExecuteQueryResponse>(
      `${DUNE_BASE_URL}/query/${queryId}/execute`,
      {},
      { headers }
    );

    const executionId = execRes.data.execution_id;

    // Step 2: Poll for result
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const resultRes = await axios.get<QueryResultResponse>(
        `${DUNE_BASE_URL}/execution/${executionId}/results`,
        { headers }
      );

      const status = resultRes.data.state;

      if (status === "QUERY_STATE_COMPLETED" && resultRes.data.result?.rows) {
        const rows = resultRes.data.result.rows;
        const numTxRaw = rows[0].num_tx;
        const numTx =
          typeof numTxRaw === "string" || typeof numTxRaw === "number"
            ? parseInt(numTxRaw.toString(), 10)
            : 0;
        return isNaN(numTx) ? 0 : numTx;
      } else if (status === "QUERY_STATE_FAILED") {
        throw new Error("Dune query failed to execute");
      }

      await new Promise(res => setTimeout(res, 3000)); // wait 3s before next try
      attempts++;
    }

    throw new Error("Dune query polling timed out");
  } catch (error) {
    console.error("Error fetching from Dune:", error);
    throw error;
  }
}
