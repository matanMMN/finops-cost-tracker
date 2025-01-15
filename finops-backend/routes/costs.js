// routes/costs.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET endpoint to retrieve all cost data with optional filtering and sorting
router.get("/", async (req, res) => {
  const { provider, sort, order } = req.query; // Extract query parameters

  let query = `
    SELECT 
      s.provider_name,  // Cloud provider name
      s.service_name,   // Service name
      p.project_name,   // Project name
      t.team_name,      // Team name
      c.cost,           // Service cost
      c.date            // Date of cost
    FROM costs c
    JOIN services s ON c.service_id = s.id
    JOIN projects p ON c.project_id = p.id
    JOIN teams t ON c.team_id = t.id
  `;

  const params = []; // Parameters for the query

  // Filter by provider name if provided
  if (provider) {
    query += ` WHERE s.provider_name = $1`;
    params.push(provider);
  }

  // Sorting the results
  if (sort) {
    const validSortFields = {
      cost: "c.cost", // Sort by cost
      project: "p.project_name", // Sort by project name
    };

    if (validSortFields[sort]) {
      query += ` ORDER BY ${validSortFields[sort]} ${
        order === "desc" ? "DESC" : "ASC"
      }`;
    }
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows); // Return the fetched data as JSON
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

module.exports = router;
