import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, initDb } from '../db.js';
await initDb();
for (const table of ['certificates','reviews','enrolments','courses','users']) {
  await pool.query(`DELETE FROM ${table}`);
  await pool.query(`ALTER TABLE ${table} AUTO_INCREMENT=1`);
}
const hash = await bcrypt.hash('Admin123!',12);
const addUser = async(name,email,password,role) => (await pool.query('INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id',[name,email,await bcrypt.hash(password,12),role])).insertId;
await addUser('SkillSpring Admin','admin@skillspring.local','Admin123!','admin');
const instructor=await addUser('Alex Instructor','instructor@skillspring.local','Instructor123!','instructor');
const learner=await addUser('Sam Learner','learner@skillspring.local','Learner123!','learner');
const courseData=[
{title:'Modern React from Zero to Production',summary:'Build modern React applications with components, hooks and practical patterns.',description:'A hands-on introduction to React application development.',category:'Web Development',level:'Beginner',status:'published',thumbnail:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900',outcomes:['Build reusable React components','Manage component state'],sections:[{title:'React foundations',lessons:[{_id:'react-welcome',title:'Welcome and setup',content:'React helps you build interfaces from reusable components.',isPreview:true,durationMinutes:8,required:true},{_id:'react-props',title:'Components and props',content:'Components are reusable UI building blocks.',durationMinutes:15,required:true},{_id:'react-state',title:'State and events',content:'State stores values that change over time.',durationMinutes:18,required:true}]}],quiz:[{_id:'q1',prompt:'What is a React component?',options:['A reusable UI building block','A database table','A CSS preprocessor'],correctIndex:0},{_id:'q2',prompt:'Which hook stores local component state?',options:['useMemo','useState','useRef'],correctIndex:1}]},
{title:'Python for Practical Problem Solving',summary:'Learn Python fundamentals through small, practical exercises.',description:'Understand variables, control flow, functions and collections.',category:'Programming',level:'Beginner',status:'published',outcomes:['Use Python collections','Write functions'],sections:[{title:'Getting started',lessons:[{_id:'python-start',title:'Your first Python program',content:'Python is a readable general-purpose language.',isPreview:true,required:true},{_id:'python-vars',title:'Variables and collections',content:'Lists, dictionaries, tuples and sets help organize data.',required:true}]}],quiz:[{_id:'q3',prompt:'Which collection stores key-value pairs?',options:['List','Dictionary','Tuple'],correctIndex:1}]},
{title:'UI Design Essentials',summary:'Create clearer interfaces with hierarchy, spacing, typography and consistency.',description:'Learn foundational visual design principles for digital products.',category:'Design',level:'Intermediate',status:'pending_review',sections:[{title:'Design basics',lessons:[{_id:'design-hierarchy',title:'Visual hierarchy',content:'Use size, contrast and placement to guide attention.',required:true}]}],quiz:[]}
];
const ids=[];
for(const c of courseData){const r=await pool.query(`INSERT INTO courses(title,summary,description,category,level,thumbnail,outcomes,instructor_id,sections,quiz,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,[c.title,c.summary,c.description,c.category,c.level,c.thumbnail||'',JSON.stringify(c.outcomes||[]),instructor,JSON.stringify(c.sections),JSON.stringify(c.quiz),c.status]);ids.push(r.insertId);}
await pool.query('INSERT INTO enrolments(learner_id,course_id) VALUES($1,$2)',[learner,ids[0]]);
console.log('Seed complete. Demo accounts created.'); await pool.end();
