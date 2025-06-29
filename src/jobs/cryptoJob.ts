import cron from "node-cron";
import { fetchAndStoreCryptoData } from "../services/crypto.service";

export function startCryptoCronJob() {
  console.log("Starting crypto data fetch cron job...");

  cron.schedule("* * * * *", async () => {
    console.log("Running crypto data fetch job...");
    await fetchAndStoreCryptoData();
  });

  console.log("Crypto data fetch cron job started.");
}
