import express from "express";
import cors from "cors";
import routes from "./routes/index";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json());

// Register all routes
app.use("/api", routes);

export { app };
