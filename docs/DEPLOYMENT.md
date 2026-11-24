# Hosting SkillSpring

The repository is configured for a Netlify frontend and a Render Node.js API. The API also requires an externally managed MySQL 8 database; neither Netlify nor Render provides the MySQL server used by this project.

## 1. Push the project to GitHub

Create a private or public GitHub repository, then from the project root:

```bash
git init
git add .
git commit -m "Prepare SkillSpring for deployment"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repository>.git
git push -u origin main
```

Do not commit `backend/.env`, database credentials, tokens, or production secrets. The root `.gitignore` excludes `.env` files.

## 2. Provision MySQL

Create a MySQL 8 database and application user with permission to create tables in that database. Record the provider's host, port, database name, username, and password. If the provider requires TLS, keep TLS enabled for the API.

The API creates tables on startup. It does not create the hosted database when `DB_AUTO_CREATE=false`; create the database in the provider dashboard first.

## 3. Deploy the API on Render

Create a Render Web Service from the GitHub repository and use the included `render.yaml` blueprint. Add the MySQL connection settings as service environment variables:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `CLIENT_ORIGIN` — the exact Netlify site origin, such as `https://your-site.netlify.app`

The blueprint sets `DB_SSL=true`, `DB_AUTO_CREATE=false`, and generates `JWT_SECRET`. Turn `DB_SSL` off only when the database provider explicitly says TLS is not supported. Wait for `/api/health` to report `{"status":"ok"}`.

For an empty database, seed demo data from a trusted local machine after setting the production database variables in the shell, then run `npm ci` and `npm run seed` from `backend`. **Seeding clears existing SkillSpring data**; do not run it on a database with user data.

## 4. Deploy the frontend on Netlify

Import the same GitHub repository into Netlify. Netlify reads `netlify.toml` for the frontend directory, build, and SPA routing. Set this build environment variable in the Netlify site settings:

```text
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

Replace the example with the API URL Render assigned to the service, then trigger a new deploy. The final Netlify URL is shown in the Netlify site overview. Verify the catalogue, login, and `/api/health` before sharing it.

## Demo account warning

The checked-in seed script creates known demo passwords. Do not seed demo accounts on a public production deployment. Create a private administrator account and use unique passwords before making the site public.
