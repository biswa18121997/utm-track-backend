
# Campaign Tracker Server

## Quick Start
1. Create `.env` in `campaign-tracker-server/`:
   ```env
   PORT=5000
   BASE_URL=http://localhost:5000
   MONGO_DB_URI=mongodb://127.0.0.1:27017/campaign-tracker
   ```
2. Install & run:
   ```bash
   npm install
   npm run dev
   ```

## API
- **POST** `/api/campaign/create`  
  JSON body:
  ```json
  {"campaignName":"Launch Sep","campaigners":["Alice","Bob"]}
  ```
  Response returns generated links.

- **GET** `/r/:code`  
  Tracks visit. Counts each IP once under that code, but increments totalClicks every hit.

- **GET** `/api/report`  
  Returns all links with `uniqueCount`, `totalClicks`, and `uniqueIPs`.

- **GET** `/api/report/:campaignName`  
  Filter report by a campaign.
