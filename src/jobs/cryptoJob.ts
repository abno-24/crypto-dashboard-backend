import cron from "node-cron";
import { fetchAndStoreCryptoData } from "../services/crypto.service";

/**
 * Starts a cron job to fetch and store crypto data every hour.
 * @example
 * startCryptoCronJob();
 */
export function startCryptoCronJob() {
  cron.schedule("0 * * * *", async () => {
    console.log("Running crypto data fetch job...");
    await fetchAndStoreCryptoData();
  });
}
