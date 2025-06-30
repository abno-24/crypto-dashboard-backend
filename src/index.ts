import dotenv from "dotenv";
import { app } from "./app";
import { initDb } from "./db/index";
import { startCryptoCronJob } from "./jobs/cryptoJob";
import { startKeepAlivePing } from "./utils/keepAlive";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    startCryptoCronJob();
    startKeepAlivePing();

    app.listen(PORT, () => {
      console.log(`Server running at PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
