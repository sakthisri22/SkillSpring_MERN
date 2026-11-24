# Manual smoke test
1. Start MySQL and create the `skillspring` database.
2. Configure `backend/.env`, run `npm run seed`, then `npm run dev`.
3. Check `GET /api/health` returns status `ok` and database `mysql`.
4. Register or sign in using one of the demo accounts.
5. Browse courses, enrol, mark a lesson complete, submit a quiz and issue a certificate.
6. Open the floating help chat and ask: “How do I enrol in a course?”
