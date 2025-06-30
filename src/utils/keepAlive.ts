import axios from "axios";

/**
 * Starts a recurring interval to ping a given URL (or a default one)
 * in order to keep the server alive (e.g. on a free tier of a cloud provider).
 * The ping is done every 10 minutes.
 *
 * @remarks
 * This function is intended to be used in a serverless environment where
 * the server may be shut down or put to sleep if not used for a certain
 * amount of time.
 */
export function startKeepAlivePing() {
  const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // every 10 mins

  const pingUrl = `${process.env.KEEP_ALIVE_URL || "https://crypto-dashboard-api-qa2y.onrender.com"}/api/health`;

  setInterval(async () => {
    try {
      const res = await axios.get(pingUrl);
      console.log(`🔄 Keep-alive ping successful:`, res.data);
    } catch (err: any) {
      console.error("⚠️ Keep-alive ping failed:", err.message);
    }
  }, KEEP_ALIVE_INTERVAL_MS);
}
