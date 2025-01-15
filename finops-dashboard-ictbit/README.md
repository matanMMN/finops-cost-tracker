FinOps Cost Tracking System
Project Overview
The primary goal of this project is to streamline cloud financial management (FinOps) by collecting and analyzing billing data from various cloud providers such as AWS and GCP. This system helps track cloud expenses, identify cost trends, and manage budgets effectively.
In this project, simulated billing data was fetched specifically from Google Cloud Platform (GCP). The data was manually inserted into BigQuery for demonstration purposes, showcasing how cloud billing data can be processed, stored, and visualized.
________________________________________
Technologies Used
Backend
•	Node.js – Server-side runtime environment
•	Express.js – Web framework for building RESTful APIs
•	PostgreSQL – Relational database for storing billing data
•	Google BigQuery – Data warehouse for cloud billing data storage
•	dotenv – Environment variable management
•	pg – PostgreSQL client for Node.js
Frontend
•	React.js – Frontend library for building UI components
•	Axios – HTTP client for API communication
•	Material UI (MUI) – UI component library for styling
________________________________________
Project Structure
finops-project/
├── backend/
│   ├── config/
│   │   └── README_KEYS.md         # Instructions for setting up sensitive keys
│   ├── .env.example               # Example environment variables
│   ├── db.js                     # PostgreSQL database connection
│   ├── index.js                  # Express server setup and API routes
│   ├── insertToDbFromBigQuery.js # Fetches data from BigQuery and inserts into PostgreSQL
│   ├── gcpMockBilling.js         # Fetches mock billing data from BigQuery
│   ├── package.json              # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js               # Main React component
│   │   ├── CostTable.jsx        # Component for displaying cost data
│   │   ├── index.js             # Renders React app
│   ├── package.json             # Frontend dependencies
├── README.md                    # Project documentation
________________________________________
Data Flow
1.	Data Insertion: Mock billing data is manually uploaded to BigQuery.
2.	Backend Processing: 
o	Node.js server connects to BigQuery.
o	Data is fetched and stored in PostgreSQL.
3.	Frontend Display: 
o	React app fetches billing data through REST API.
o	Data is presented in a dynamic table with sorting and budget tracking features.
________________________________________
Getting Started
1. Backend Setup
cd backend
npm install
npm run dev
2. Frontend Setup
cd frontend
npm install
npm start
________________________________________
Setting Up Sensitive Configuration Files
1.	Download the provided ZIP file containing the sensitive configuration files.
2.	Extract the contents into the backend/config/ folder.
Folder Structure:
backend/
└── config/
    ├── service-account-1.json
    └── service-account-2.json
3.	Copy the .env.example file to .env and fill in the necessary values:
cp backend/.env.example backend/.env
4.	Run the backend server:
cd backend
npm run dev
________________________________________
Features
•	Cloud Billing Data Integration – Fetches billing data from BigQuery.
•	PostgreSQL Storage – Secure storage and management of billing data.
•	Dynamic Cost Table – Sort and filter cost data by provider, service, project, and more.
•	Budget Tracking – Input budget and receive alerts when exceeded.
________________________________________
Future Improvements
•	Integration with AWS billing data.
•	Real-time data synchronization.
•	Advanced data visualization (charts, graphs).
•	User authentication and access control.
________________________________________
Author
Matan Maman
Junior Integration Engineer | Full Stack Developer

