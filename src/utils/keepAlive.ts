import axios from "axios";

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
