import React from "react";
import Button from "@mui/material/Button";

import CostTable from "./Components/CostTable.jsx";

function App() {
  return (
    <div className="App">
      <h1>Welcome to FinOps Dashboard</h1>
      <br></br>
      <CostTable />
    </div>
  );
}

export default App;
