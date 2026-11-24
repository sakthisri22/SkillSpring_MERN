# Architecture
- Frontend: React, TypeScript, Vite and React Router
- Backend: Node.js, Express and REST APIs
- Database: MySQL 8 accessed through mysql2
- Authentication: JWT bearer tokens and bcrypt password hashing
- Help chatbot: FAQ-based Express endpoint consumed by a floating React chat widget

MySQL tables: `users`, `courses`, `enrolments`, `reviews` and `certificates`. Foreign keys enforce relationships. Course sections, lessons, quiz questions and options are stored as MySQL JSON columns for this MVP.
