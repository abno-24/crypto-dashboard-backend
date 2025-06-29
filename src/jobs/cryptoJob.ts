import cron from "node-cron";
import { fetchAndStoreCryptoData } from "../services/crypto.service";

/**
 * Schedules a cron job to fetch and store cryptocurrency data every hour.
 * The job logs a message before executing the fetch process.
 */
export function startCryptoCronJob() {
  cron.schedule("0 * * * *", async () => {
    console.log("Running crypto data fetch job...");
    await fetchAndStoreCryptoData();
  });
}
