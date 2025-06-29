import dotenv from "dotenv";
import { app } from "./app";
import { initDb } from "./db/index";
import { startCryptoCronJob } from "./jobs/cryptoJob";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

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
