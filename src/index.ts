import dotenv from "dotenv";
import { app } from "./app";
import { initDb } from "./db/index";
import { startCryptoCronJob } from "./jobs/cryptoJob";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

/**
 * Initializes the database and starts the cron job for fetching and storing crypto data,
 * then starts the Express.js server.
 *
 * @throws {Error} If there is an error initializing the database or starting the cron job.
 */
async function startServer() {
  try {
    await initDb();
    startCryptoCronJob();

    app.listen(PORT, () => {
      console.log(`Server running at PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
