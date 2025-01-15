require("dotenv").config();
const { BigQuery } = require("@google-cloud/bigquery");
const path = require("path");

// Initialize BigQuery connection using service account key from .env
const bigquery = new BigQuery({
  keyFilename: path.join(__dirname, process.env.GCP_KEY_PATH),
  location: "US",
});

// Fetch billing data from the mock table in BigQuery
async function fetchBillingMockData() {
  const query = `
    SELECT *
    FROM \`nimble-chimera-447113-m8.finopsCost.billing_mock\`
    ;
  `;

  const options = {
    query: query,
    location: "US",
  };

  try {
    const [rows] = await bigquery.query(options);
    console.log("Billing Mock Data:", rows);
    return rows;
  } catch (error) {
    console.error("Error fetching billing data:", error);
    return [];
  }
}

module.exports = { fetchBillingMockData };
