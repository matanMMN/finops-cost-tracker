const { Pool } = require("pg");
require("dotenv").config();

// Create a new PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// Connect to PostgreSQL and log the status
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL RDS"))
  .catch((err) => console.error("Error connecting to PostgreSQL RDS:", err));

// Export the pool for use in other modules
module.exports = pool;
