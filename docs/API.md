# SkillSpring API reference

Base URL: `http://localhost:5000/api`

Send `Authorization: Bearer <JWT>` for protected endpoints. JSON request bodies use `Content-Type: application/json`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Register learner/instructor |
| POST | `/auth/login` | Public | Login |
| GET | `/auth/me` | Authenticated | Current user |
| GET | `/courses` | Public | Published catalogue (`q`, `category`, `level`, `page`, `limit`) |
| GET | `/courses/:id` | Public | Published course detail |
| POST | `/courses` | Instructor/Admin | Create draft |
| PATCH | `/courses/:id` | Owner/Admin | Update draft |
| POST | `/courses/:id/submit` | Owner/Admin | Submit for review |
| POST | `/courses/:id/enrol` | Learner | Free enrolment |
| GET | `/courses/:id/reviews` | Public | Course reviews |
| POST | `/courses/:id/reviews` | Enrolled learner | Create review |
| GET | `/learning/mine` | Learner | My enrolments |
| GET | `/learning/courses/:courseId` | Enrolled learner | Full course learning data |
| PUT | `/learning/lessons/:lessonId/progress` | Learner | Mark lesson progress |
| POST | `/learning/quizzes/:courseId/submit` | Enrolled learner | Submit quiz answers |
| GET | `/learning/certificates/mine` | Learner | My certificates |
| POST | `/learning/certificates/:courseId/issue` | Learner | Issue eligible certificate |
| GET | `/learning/certificates/verify/:code` | Public | Verify certificate |
| GET | `/instructor/courses` | Instructor/Admin | Own courses |
| GET | `/admin/overview` | Admin | Platform counts |
| GET | `/admin/review-queue` | Admin | Pending courses |
| POST | `/admin/courses/:id/approve` | Admin | Approve course |
| POST | `/admin/courses/:id/reject` | Admin | Reject with reason |
| GET | `/admin/users` | Admin | Recent users |
| PATCH | `/admin/users/:id/active` | Admin | Activate/deactivate user |

## Common status codes
- `200`: successful read/update/action
- `201`: resource created
- `400`: invalid input or business rule
- `401`: missing/invalid/expired token
- `403`: authenticated but not permitted
- `404`: resource not found or not visible
- `409`: duplicate/conflicting operation
- `500`: unexpected server error

## Example login
```json
{ "email": "learner@skillspring.local", "password": "Learner123!" }
```
Response:
```json
{ "token": "<jwt>", "user": { "id": "...", "name": "Sam Learner", "email": "...", "role": "learner" } }
```


## Website help chatbot
- `POST /api/chatbot` — public FAQ assistant. Request body: `{ \"message\": \"How do I enrol?\" }`; returns an `answer` and suggested questions.
