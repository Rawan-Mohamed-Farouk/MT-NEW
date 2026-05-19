# Cloud Deployment Guide (XAMPP to Free Online Base)

This guide walks you through migrating your project from local XAMPP to free online cloud hosting providers. We are using Vercel instead of Render because Vercel **never asks for a credit card** for standard python deployments!

## Understanding the New Architecture
* **Database (MySQL):** Aiven (Free Tier)
* **Backend (FastAPI):** Vercel (Free Tier)
* **Frontend (React):** Vercel (Free Tier)

> [!IMPORTANT]
> **Prerequisites:** Push the newest changes I just created (the `api` folder and `vercel.json` file) to your GitHub repository before starting!

---

## Step 1: Set Up Online Database (Aiven)
1. Go to [Aiven](https://aiven.io/) and sign up for a free account.
2. Create a new **MySQL** database on the Free plan.
3. Wait for it to build, then go to the "Overview" page to find your **Connection Details**:
   - Host (e.g., `mysql-1234.aivencloud.com`)
   - Port (e.g., `25060`)
   - User (e.g., `avnadmin`)
   - Password
   - Database Name (e.g., `defaultdb`)

---

## Step 2: Deploy Backend to Vercel
1. Go to [Vercel](https://vercel.com/) and sign up with GitHub.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **IMPORTANT**: For the backend, leave the "Framework Preset" as **Other** and leave the "Root Directory" exactly as it is (empty/default).
5. In the **Environment Variables** section, add your database variables. *Remember to add the port to the end of your host string!*
   * `DB_HOST` = (Your Aiven Host + Port. e.g. `mysql-1234.aiven.com:12345`)
   * `DB_USER` = (Your Aiven User)
   * `DB_PASS` = (Your Aiven Password)
   * `DB_NAME` = (Your Aiven DB Name)
   * `OPENAI_API_KEY` = (Optional)
   * `GROQ_API_KEY` = (Optional)
6. Click **Deploy**.
7. Wait for the deployment to finish. Vercel will give you a live URL like `https://empowerwork...vercel.app`. **Copy this URL for Step 3.**

### 2a. Run Database Restructure Manually (One-time)
Because the new MySQL database on Aiven is completely empty, it won't have your tables or tools/disabilities records.
You need to run the data migration scripts from your local computer against the cloud database:
1. On your PC, temporarily create a `.env` file in your root folder (or edit `backend/.env` if you have one) to use your new **Aiven Database Credentials** instead of XAMPP's `localhost`.
2. Run the migration and seed scripts locally (they will connect over the internet to Aiven and create the tables):
   ```bash
   python backend/scripts/migrations/migrate_disabilities.py
   python backend/scripts/migrations/migrate_tools.py
   python backend/scripts/seeds/seed_disabilities.py
   python backend/scripts/seeds/seed_assistive_tools.py
   python backend/scripts/seeds/seed_jobs.py
   ```
3. Once completed, your Aiven database is fully set up!

---

## Step 3: Deploy Frontend to Vercel
Now that your API backend is online, we will deploy the frontend as a separate project so it can talk to it!
1. Go back to the Vercel Dashboard and click **Add New** -> **Project**.
2. Import your GitHub repository again.
3. **IMPORTANT**: This time, you MUST set the **Root Directory** to `frontend`. Click "Edit" next to Root Directory, select `frontend`, and save. Framework Preset should auto-detect as "Vite".
4. In the **Environment Variables** section, add exactly one:
   * Name: `VITE_API_URL`
   * Value: `HTTPS_URL_COPIED_IN_STEP_2/api` (e.g. `https://empowerwork-backend.vercel.app/api`. Make sure there is NO trailing slash at the end).
5. Click **Deploy**.
6. Vercel will build your React application and provide you with a live, shareable URL!

## Final Success Checklist
- [ ] Database is live on Aiven and filled with seeded data.
- [ ] Backend is live on Vercel and connected to Aiven database.
- [ ] Frontend is live on Vercel and successfully fetching data from your Vercel Backend API.
