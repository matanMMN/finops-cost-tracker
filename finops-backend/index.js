const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { fetchBillingMockData } = require("./gcpMockBilling");

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// API endpoint - Fetch data from PostgreSQL
app.get("/api/costs", async (req, res) => {
  try {
    console.log("🔄 Fetching mock data from the database...");
    const result = await pool.query(`
      SELECT 
        COALESCE(s.service_name, 'Unknown') AS service_name, 
        COALESCE(p.project_name, 'Unknown') AS project_name, 
        COALESCE(t.team_name, 'Unknown') AS team_name, 
        c.cost, 
        c.date, 
        COALESCE(s.provider_name, 'Unknown') AS provider_name
      FROM costs c
      LEFT JOIN services s ON c.service_id = s.id
      LEFT JOIN projects p ON c.project_id = p.id
      LEFT JOIN teams t ON c.team_id = t.id
    `);

    console.log("Mock data fetched successfully:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error retrieving mock data:", err);
    res.status(500).send("Error retrieving mock data");
  }
});

// API endpoint - Load mock data into PostgreSQL from BigQuery
app.get("/load-mock-data", async (req, res) => {
  try {
    console.log("🔄 Fetching mock data from BigQuery...");
    const mockData = await fetchBillingMockData();

    for (const record of mockData) {
      // Insert service
      const serviceResult = await pool.query(
        `INSERT INTO services (service_name, provider_name, cost, date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (service_name, provider_name) DO NOTHING
         RETURNING id;`,
        [
          record.service.description,
          record.seller_name || "Google Cloud",
          record.cost,
          record.usage_start_time,
        ]
      );
      const serviceId = serviceResult.rows[0]?.id;

      // Insert project
      const projectResult = await pool.query(
        `INSERT INTO projects (project_name)
         VALUES ($1)
         ON CONFLICT (project_name) DO NOTHING
         RETURNING id;`,
        [record.project.name]
      );
      const projectId = projectResult.rows[0]?.id;

      // Insert team
      const teamName =
        record.labels.find((label) => label.key === "team")?.value || "Team A";
      const teamResult = await pool.query(
        `INSERT INTO teams (team_name)
         VALUES ($1)
         ON CONFLICT (team_name) DO NOTHING
         RETURNING id;`,
        [teamName]
      );
      const teamId = teamResult.rows[0]?.id;

      // Insert into costs
      await pool.query(
        `INSERT INTO costs (service_id, project_id, team_id, cost, date)
         VALUES ($1, $2, $3, $4, $5);`,
        [
          serviceId,
          projectId,
          teamId,
          record.cost,
          new Date(record.usage_start_time).toISOString().split("T")[0],
        ]
      );
    }

    console.log("Mock data loaded into PostgreSQL.");
    res.send("Mock data loaded into the database.");
  } catch (err) {
    console.error("Error loading mock data:", err);
    res.status(500).send("Error loading mock data");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
