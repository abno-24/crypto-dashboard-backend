import cron from "node-cron";
import { fetchAndStoreCryptoData } from "../services/crypto.service";

export function startCryptoCronJob() {
  cron.schedule("0 * * * *", async () => {
    console.log("Running crypto data fetch job...");
    await fetchAndStoreCryptoData();
  });
}
