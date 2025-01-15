require("dotenv").config();
const { BigQuery } = require("@google-cloud/bigquery");
const { Pool } = require("pg");
const path = require("path");

// PostgreSQL connection
console.log("🔄 Connecting to PostgreSQL...");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// Check PostgreSQL connection
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL RDS"))
  .catch((err) => {
    console.error("Error connecting to PostgreSQL RDS:", err);
    process.exit(1);
  });

// BigQuery connection
console.log("Connecting to BigQuery...");
const bigquery = new BigQuery({
  keyFilename: path.join(
    __dirname,
    "config/nimble-chimera-447113-m8-fe2cda41e559.json"
  ),
  location: "US",
});

// Fetch data from billing_mock
async function fetchBillingData() {
  const query = `
    SELECT 
      service.description AS service_name,
      seller_name AS provider_name,
      project.name AS project_name,
      cost,
      usage_start_time,
      ARRAY(
        SELECT AS STRUCT key, value
        FROM UNNEST(labels)
      ) AS labels
    FROM \`nimble-chimera-447113-m8.finopsCost.billing_mock\`
    ;
  `;

  const options = { query, location: "US" };

  try {
    const [rows] = await bigquery.query(options);
    console.log(`Fetched ${rows.length} records from BigQuery.`);
    return rows;
  } catch (error) {
    console.error("Error fetching data from BigQuery:", error);
    return [];
  }
}

// Insert data into PostgreSQL
async function insertDataToDB() {
  const data = await fetchBillingData();
  if (data.length === 0) {
    console.warn("No data fetched from BigQuery. Exiting.");
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const record of data) {
      const {
        service_name,
        provider_name,
        project_name,
        cost,
        usage_start_time,
        labels,
      } = record;

      // Safe date formatting
      let formattedDate;
      if (usage_start_time && typeof usage_start_time === "string") {
        const parsedDate = new Date(usage_start_time);
        formattedDate = isNaN(parsedDate.getTime())
          ? new Date().toISOString().split("T")[0]
          : parsedDate.toISOString().split("T")[0];
      } else {
        formattedDate = new Date().toISOString().split("T")[0];
      }

      console.log(
        `Processing record: Service - ${service_name}, Project - ${project_name}, Date - ${formattedDate}`
      );

      // Insert service
      const serviceResult = await client.query(
        `INSERT INTO services (service_name, provider_name, cost, date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (service_name, provider_name) DO UPDATE SET cost = EXCLUDED.cost
         RETURNING id;`,
        [service_name, provider_name, cost, formattedDate]
      );
      const serviceId = serviceResult.rows[0]?.id;

      // Insert project
      const projectResult = await client.query(
        `INSERT INTO projects (project_name)
         VALUES ($1)
         ON CONFLICT (project_name) DO NOTHING
         RETURNING id;`,
        [project_name]
      );
      const projectId = projectResult.rows[0]?.id;

      // Insert or get team
      const teamLabel = labels.find((label) => label.key === "owner");
      const teamName = teamLabel
        ? teamLabel.value
        : `Team ${Math.floor(Math.random() * 3) + 1}`;

      const teamResult = await client.query(
        `INSERT INTO teams (team_name)
         VALUES ($1)
         ON CONFLICT (team_name) DO NOTHING
         RETURNING id;`,
        [teamName]
      );
      const teamId = teamResult.rows[0]?.id;

      // Insert into costs
      await client.query(
        `INSERT INTO costs (service_id, project_id, team_id, cost, date)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING;`,
        [serviceId, projectId, teamId, cost, formattedDate]
      );

      console.log(
        `Inserted data: Service - ${service_name}, Project - ${project_name}, Team - ${teamName}, Cost - ${cost}`
      );
    }

    await client.query("COMMIT");
    console.log("All data inserted successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error inserting data into PostgreSQL:", err);
  } finally {
    client.release();
  }
}

insertDataToDB();
