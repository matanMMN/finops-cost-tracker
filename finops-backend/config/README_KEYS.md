# 🔐 Setting Up Configuration Files

This project requires sensitive configuration files that are **not included** in the repository.

## Files Needed:
1. `service-account-1.json` – Google Cloud service account key.  
2. `service-account-2.json` – Google Cloud service account key.

## Setup Instructions:
1. Download the provided ZIP file with the configuration files.  
2. Extract and place the files in the `backend/config/` folder.

### Folder Structure:
```
backend/
└── config/
    ├── service-account-1.json
    └── service-account-2.json
```

3. Run the backend server:
```bash
cd backend
npm install
npm run dev
```
