# Cloud Deployment Guide (XAMPP to Free Online Base)

This guide walks you through migrating your project from local XAMPP to free online cloud hosting providers.

## Understanding the New Architecture
* **Database (MySQL):** Aiven (Free Tier)
* **Backend (FastAPI):** Render (Free Tier)
* **Frontend (React):** Vercel (Free Tier)

> [!IMPORTANT]
> **Prerequisites:** Push your entire project to a GitHub repository before starting. Both Render and Vercel will automatically deploy directly from your GitHub repo.

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

## Step 2: Deploy Backend to Render
1. Go to [Render](https://render.com/) and sign up with GitHub.
2. Click **New** -> **Web Service**.
3. Select "Build and deploy from a Git repository".
4. Choose your GitHub repository.
5. In the form, make sure the language is set to **Python 3**.
6. The `render.yaml` file I created will automatically fill in the build and start commands (`pip install -r requirements.txt` and `uvicorn backend.src.main:app...`).
7. **Environment Variables:** Scroll down and click "Advanced", then "Add Environment Variable". Add all the variables from your local `.env` file:
   * `DB_HOST` = (Your Aiven Host)
   * `DB_USER` = (Your Aiven User)
   * `DB_PASS` = (Your Aiven Password)
   * `DB_NAME` = (Your Aiven DB Name)
   * `GROQ_API_KEY` = (Your Groq Key)
   * `OPENAI_API_KEY` = (Your OpenAI Key)
   * `ADMIN_SECRET_KEY` = (Your Admin Secret Key)
8. Click **Create Web Service**.
9. Wait for the deployment to finish. Render will give you a live URL like `https://empowerwork-backend.onrender.com`.

### 2a. Run Database Restructure Manually (One-time)
Because the new MySQL database on Aiven is completely empty, it won't have your tables or tools/disabilities records.
You need to run the data migration scripts from your local computer against the cloud database:
1. On your PC, temporarily edit your `.env` file to use the **Aiven Database Credentials** instead of XAMPP's `localhost`.
2. Run the migration and seed scripts locally (they will connect over the internet to Aiven and create the tables):
   ```bash
   python backend/scripts/migrations/migrate_disabilities.py
   python backend/scripts/migrations/migrate_tools.py
   python backend/scripts/seeds/seed_disabilities.py
   python backend/scripts/seeds/seed_assistive_tools.py
   python backend/scripts/seeds/seed_jobs.py
   ```
3. Once completed, your Aiven database is fully set up. You can revert your local `.env` if you want.

---

## Step 3: Deploy Frontend to Vercel
1. Go to [Vercel](https://vercel.com/) and sign up with GitHub.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **IMPORTANT**: In the "Framework Preset", it will usually detect "Vite". But you MUST set the **Root Directory** to `frontend`. Click "Edit" next to Root Directory, select `frontend`, and save.
5. In the **Environment Variables** section, add exactly one:
   * Name: `VITE_API_URL`
   * Value: `https://empowerwork-backend.onrender.com/api` (Replace this with the exact Render URL generated in Step 2. Do not put a trailing slash.)
6. Click **Deploy**.
7. Vercel will build your React application and provide you with a live, shareable URL!

## Final Success Checklist
- [ ] Database is live on Aiven and filled with seeded data.
- [ ] Backend is live on Render and connected to Aiven database.
- [ ] Frontend is live on Vercel and successfully fetching data from your Render Backend API.
