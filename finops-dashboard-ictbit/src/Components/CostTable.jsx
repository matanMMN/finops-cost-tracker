import React, { useEffect, useState } from "react";
import axios from "axios";

// Import Material UI components for UI design
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

// CostTable Component - displays billing data in a table
const CostTable = () => {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [budget, setBudget] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [isOverBudget, setIsOverBudget] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/costs");
        setCosts(response.data);
        calculateTotalCost(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total cost and check budget
  const calculateTotalCost = (data) => {
    const total = data.reduce((sum, item) => sum + parseFloat(item.cost), 0);
    setTotalCost(total);

    // Check if budget is set and compare it with total cost
    if (budget && parseFloat(budget) > 0) {
      if (parseFloat(budget) >= total) {
        setIsOverBudget(true);
      } else {
        setIsOverBudget(false);
      }
    } else {
      setIsOverBudget(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    // Sort data by selected key and direction
    const sortedData = [...costs].sort((a, b) => {
      if (key === "cost") {
        return direction === "asc"
          ? parseFloat(a[key]) - parseFloat(b[key])
          : parseFloat(b[key]) - parseFloat(a[key]);
      } else if (key === "date") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      } else {
        return direction === "asc"
          ? a[key]?.localeCompare(b[key])
          : b[key]?.localeCompare(a[key]);
      }
    });

    setCosts(sortedData);
    setSortConfig({ key, direction });
  };

  // Handle loading and error states
  if (loading) return <Typography>Loading data...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Billing Costs Table
      </Typography>

      {/* Budget Input */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
        <TextField
          label="Enter your budget"
          type="number"
          value={budget}
          onChange={(e) => {
            setBudget(e.target.value);
            calculateTotalCost(costs); // Recalculate when budget changes
          }}
          variant="outlined"
          size="small"
        />
        <Typography variant="body1">
          Total Cost: <strong>${totalCost.toFixed(2)}</strong>
        </Typography>
      </Box>

      {/* Budget Exceeded Alert */}
      {isOverBudget && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Warning: Budget (${parseFloat(budget).toFixed(2)}) is lower than or
          equal to the total cost (${totalCost.toFixed(2)})!
        </Alert>
      )}

      {/* Sort Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="outlined" onClick={() => handleSort("provider_name")}>
          Sort by Provider
        </Button>
        <Button variant="outlined" onClick={() => handleSort("service_name")}>
          Sort by Service
        </Button>
        <Button variant="outlined" onClick={() => handleSort("project_name")}>
          Sort by Project
        </Button>
        <Button variant="outlined" onClick={() => handleSort("team_name")}>
          Sort by Team
        </Button>
        <Button variant="outlined" onClick={() => handleSort("cost")}>
          Sort by Cost
        </Button>
        <Button variant="outlined" onClick={() => handleSort("date")}>
          Sort by Date
        </Button>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider Name</TableCell>
              <TableCell>Service Name</TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Team Name</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costs.map((cost, index) => (
              <TableRow key={index}>
                <TableCell>{cost.provider_name}</TableCell>
                <TableCell>{cost.service_name}</TableCell>
                <TableCell>{cost.project_name}</TableCell>
                <TableCell>{cost.team_name}</TableCell>
                <TableCell>${parseFloat(cost.cost).toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(cost.date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CostTable;
