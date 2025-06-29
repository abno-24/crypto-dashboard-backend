import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
});

/**
 * Initializes the PostgreSQL database schema if it does not already exist.
 *
 * @throws {Error} If there is an error initializing the database schema.
 */
export async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crypto_data (
        id SERIAL PRIMARY KEY,
        coin VARCHAR(10) NOT NULL,
        volume_usd DECIMAL NOT NULL,
        transaction_count BIGINT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database schema initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export default pool;
