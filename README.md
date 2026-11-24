# SkillSpring — MySQL learning platform

A full-stack, Udemy-inspired learning platform built with **MySQL, Express, React and Node.js**. The MongoDB and PostgreSQL versions have been replaced with MySQL 8 and the `mysql2` driver.

## Included
- Learner, instructor and administrator roles
- JWT authentication and bcrypt password hashing
- Public course catalogue, search and category filters
- Instructor course authoring with sections and lessons
- Admin course moderation (approve/reject)
- Free course enrolment, lesson completion and progress tracking
- Quizzes with server-side scoring
- Course reviews
- Completion certificates with public verification
- Floating website-help chatbot for common SkillSpring questions
- Seed data, API documentation and responsive UI

## Requirements
- Node.js 20+ and npm 10+
- MySQL 8.0+ (local installation or hosted MySQL)

## Quick start

### 1. Create the database
Install MySQL Community Server and start the MySQL service. Open MySQL Workbench or the MySQL command line and run:

```sql
CREATE DATABASE skillspring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The application creates its tables automatically when the backend starts.

### 2. Configure and start the backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=skillspring
JWT_SECRET=replace-with-a-long-random-secret
```

Then run:

```bash
npm run seed
npm run dev
```

API: `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

### 3. Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`.

## Demo accounts
- Admin: `admin@skillspring.local` / `Admin123!`
- Instructor: `instructor@skillspring.local` / `Instructor123!`
- Learner: `learner@skillspring.local` / `Learner123!`

These are local-demo credentials only. Change them before deployment. `npm run seed` clears and recreates the demo tables and data.

## Chatbot
The floating **Need help?** widget is available throughout the website. It answers common questions about registration, login, course discovery, enrolment, progress, quizzes, certificates, instructor tools, admin review and payments. The current chatbot is a built-in FAQ assistant and does not require an external AI API key. It does not access private account data or perform actions on behalf of users.

## Database design
- `users`: accounts, roles and password hashes
- `courses`: course metadata plus JSON curriculum and quiz fields
- `enrolments`: learner-course relationship and progress
- `reviews`: course ratings and feedback
- `certificates`: issued completion certificates

The main entities use MySQL tables, primary keys, foreign keys and unique constraints. Flexible course sections, lessons, outcomes and quiz content use MySQL JSON columns.

## Useful commands
```bash
cd backend
npm run dev
npm run seed
npm start
```

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for the Netlify frontend, Render API, and hosted MySQL setup. Production hosting requires a managed MySQL database and provider-specific environment variables.

This is an MVP starter, not production-certified. Add migrations, automated tests, payment processing, video hosting, email verification, password reset, backups and deployment hardening before public launch. The chatbot currently uses a curated FAQ knowledge base; an LLM-powered assistant can be connected later if desired.
