import { Router } from 'express';
const router = Router();
const knowledge = [
  { keys: ['register','sign up','create account','account'], answer: 'To create an account, choose “Join for free” or “Create an account”, enter your name, email and a password of at least 8 characters, then submit. Choose Learner or Instructor as your account type.' },
  { keys: ['login','log in','sign in','password'], answer: 'Use the Log in link in the top navigation and enter the email and password you registered with. If your password is not accepted, double-check the email address and password; password reset is not included in this MVP yet.' },
  { keys: ['course','catalogue','catalog','search','find'], answer: 'Open “Explore courses” to browse published courses. You can search by title or description and filter the catalogue by category. Select a course card to view its description, learning outcomes and curriculum.' },
  { keys: ['enrol','enroll','join course','start course'], answer: 'Open a published course and select the enrol button. After enrolling, visit “My learning” and choose “Continue learning” to open your classroom.' },
  { keys: ['progress','complete lesson','lesson','track'], answer: 'Inside your classroom, select a lesson and use “Mark lesson complete” to save your progress. Your My learning page shows the percentage completed for each enrolled course.' },
  { keys: ['quiz','test','assessment','exam'], answer: 'When a course includes a quiz, answer each question and select Submit quiz. The current passing score is 70%. You can review the result and try again.' },
  { keys: ['certificate','completion certificate'], answer: 'Certificates become available after all required lessons are complete and, when the course has a quiz, you have passed it. Use “Check and issue certificate” in the classroom. Each certificate has a public verification link and unique code.' },
  { keys: ['instructor','teach','publish','create course'], answer: 'Register with the Instructor account type, then open Instructor studio. Create a draft course with a title, short description and category, add lesson content, and submit it for administrator review before it appears in the public catalogue.' },
  { keys: ['admin','approve','review course','reject'], answer: 'Administrators can sign in with an admin account and open the Admin dashboard. The review queue lists submitted courses and provides approve or reject actions.' },
  { keys: ['payment','price','paid','subscription'], answer: 'This SkillSpring MVP currently provides free course enrolment. Online payments, subscriptions and instructor payouts are not implemented.' },
  { keys: ['contact','support','help','bug','error','problem'], answer: 'I can answer common questions about using SkillSpring. If you have a technical error, note the page, the action you took and the exact error message so the project administrator can investigate.' }
];
function answerMessage(req, res) {
  const message = String(req.body.message || '').trim().slice(0, 500);
  if (!message) return res.status(400).json({ message: 'Please enter a question.' });
  const normalized = message.toLowerCase();
  const match = knowledge.find(item => item.keys.some(key => normalized.includes(key)));
  const answer = match?.answer || 'I’m the SkillSpring website assistant. I can help with accounts, finding courses, enrolment, lessons and progress, quizzes, certificates, instructor tools and admin reviews. Try asking one of those questions in a little more detail.';
  res.json({ answer, source: match ? 'skillspring-help' : 'fallback' });
}
router.post('/', answerMessage);
router.post('/message', answerMessage);
export default router;
