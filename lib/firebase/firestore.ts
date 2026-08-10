import { db } from './config';
import {
  collection, addDoc, getDocs, getDoc, query, where, orderBy,
  deleteDoc, doc, updateDoc, Timestamp, setDoc, limit
} from 'firebase/firestore';

export interface NoteFile { url: string; thumb?: string; originalName: string; size: number; source: string; type: string; }
export interface NoteSubmission { id?: string; studentId: string; studentName: string; class: string; section: string; subject: string; type: 'Notes'|'Homework'|'Notice'; chapter?: string; title: string; content: string; files: NoteFile[]; createdAt: any; }
export interface StudentProfile { id: string; full_name: string; student_id: string; class: string; section: string; roll_no: string; house: string; gender: string; date_of_birth: string; father_name: string; mother_name: string; parent_phone: string; blood_group: string; sr_no: string; photoURL?: string; is_active: boolean; }
export interface TeacherProfile { id: string; full_name: string; username: string; password?: string; class?: string; section?: string; }
export interface SubjectCurriculum { id: string; class: string; name: string; book?: string; publisher?: string; chapters: string[]; }

export async function addNote(d: Omit<NoteSubmission,'id'|'createdAt'>) { const r = await addDoc(collection(db,'notes'), {...d,createdAt:Timestamp.now()}); return r.id; }
export async function getNotesByClassSection(cls: string, sec: string): Promise<NoteSubmission[]> { try { const qq = query(collection(db,'notes'),where('class','==',cls.toUpperCase()),where('section','==',sec.toUpperCase()),orderBy('createdAt','desc'),limit(200)); return (await getDocs(qq)).docs.map(d=>({id:d.id,...d.data()} as NoteSubmission)); } catch(e) { return []; } }
export async function getNotices(cls: string, sec: string): Promise<NoteSubmission[]> { try { const qq = query(collection(db,'notes'),where('class','==',cls.toUpperCase()),where('section','==',sec.toUpperCase()),where('type','==','Notice'),orderBy('createdAt','desc'),limit(50)); return (await getDocs(qq)).docs.map(d=>({id:d.id,...d.data()} as NoteSubmission)); } catch(e) { return []; } }
export async function getNotesBySubject(cls: string, sec: string, sub: string): Promise<NoteSubmission[]> { try { const qq = query(collection(db,'notes'),where('class','==',cls.toUpperCase()),where('section','==',sec.toUpperCase()),where('subject','==',sub),orderBy('createdAt','desc'),limit(200)); return (await getDocs(qq)).docs.map(d=>({id:d.id,...d.data()} as NoteSubmission)); } catch(e) { return []; } }
export async function getMyNotes(sid: string): Promise<NoteSubmission[]> { try { const qq = query(collection(db,'notes'),where('studentId','==',sid),orderBy('createdAt','desc'),limit(200)); return (await getDocs(qq)).docs.map(d=>({id:d.id,...d.data()} as NoteSubmission)); } catch(e) { return []; } }
export async function deleteNote(id: string) { try { await deleteDoc(doc(db,'notes',id)); return true; } catch(e) { return false; } }

export async function getStudentById(id: string): Promise<StudentProfile|null> { try { const d = await getDoc(doc(db,'students',id)); return d.exists() ? ({id:d.id,...d.data()} as StudentProfile) : null; } catch(e) { return null; } }
export async function findStudent(sid: string): Promise<StudentProfile|null> { try { const d = await getDoc(doc(db,'students',sid)); if(d.exists()) return {id:d.id,...d.data()} as StudentProfile; const qq = query(collection(db,'students'),where('student_id','==',sid),limit(1)); const s = await getDocs(qq); if(!s.empty){ const dd=s.docs[0]; return {id:dd.id,...dd.data()} as StudentProfile; } return null; } catch(e) { return null; } }
export async function findStudentByName(nm: string, dob: string): Promise<StudentProfile|null> { try { const qq = query(collection(db,'students'),where('full_name','>=',nm.toUpperCase()),where('full_name','<=',nm.toUpperCase()+'\uf8ff'),limit(30)); const s = await getDocs(qq); const matches: any[] = []; s.forEach(d => { const dt = d.data(); if((dt.date_of_birth||dt.dob||'')===dob) matches.push({id:d.id,...dt}); }); return matches.length ? matches[0] as StudentProfile : null; } catch(e) { return null; } }
export async function getStudentsByClass(cls: string, sec?: string): Promise<StudentProfile[]> { try { let qq = query(collection(db,'students'),where('class','==',cls.toUpperCase()),limit(200)); if(sec) qq = query(qq,where('section','==',sec.toUpperCase())); return (await getDocs(qq)).docs.map(d=>({id:d.id,...d.data()} as StudentProfile)); } catch(e) { return []; } }
export async function updateStudent(id: string, upd: Partial<StudentProfile>) { try { await updateDoc(doc(db,'students',id), upd as any); return true; } catch(e) { return false; } }
export async function addStudent(data: StudentProfile) { try { await setDoc(doc(db,'students',data.student_id||data.id), data); return true; } catch(e) { return false; } }
export async function deleteStudent(id: string) { try { await deleteDoc(doc(db,'students',id)); return true; } catch(e) { return false; } }

export async function getTeacherByUsername(uname: string): Promise<TeacherProfile|null> { try { const qq = query(collection(db,'teachers'),where('username','==',uname),limit(1)); const s = await getDocs(qq); if(!s.empty) { const d = s.docs[0]; return {id:d.id,...d.data()} as TeacherProfile; } return null; } catch(e) { return null; } }
export async function getAllTeachers(): Promise<TeacherProfile[]> { try { return (await getDocs(collection(db,'teachers'))).docs.map(d=>({id:d.id,...d.data()} as TeacherProfile)); } catch(e) { return []; } }
export async function addTeacher(d: Omit<TeacherProfile,'id'>) { return (await addDoc(collection(db,'teachers'), d)).id; }
export async function deleteTeacher(id: string) { try { await deleteDoc(doc(db,'teachers',id)); return true; } catch(e) { return false; } }

export async function getCurriculum(cls: string): Promise<SubjectCurriculum[]> { try { const qq = query(collection(db,'curriculum'),where('class','==',cls.toUpperCase()),limit(100)); return (await getDocs(qq)).docs.map(d=>({id:d.id,...d.data()} as SubjectCurriculum)); } catch(e) { return []; } }
export async function addCurriculum(d: Omit<SubjectCurriculum,'id'>) { return (await addDoc(collection(db,'curriculum'), d)).id; }
export async function updateCurriculum(id: string, u: Partial<SubjectCurriculum>) { try { await updateDoc(doc(db,'curriculum',id), u as any); return true; } catch(e) { return false; } }
export async function deleteCurriculum(id: string) { try { await deleteDoc(doc(db,'curriculum',id)); return true; } catch(e) { return false; } }

export async function getNotesAssignment(cls: string, sec: string): Promise<Record<string,{student_id:string;student_name:string}>> { try { const d = await getDoc(doc(db,'settings',`notes_student_${cls.toUpperCase()}_${sec.toUpperCase()}`)); return d.exists() ? (d.data().subjects||{}) : {}; } catch(e) { return {}; } }
export async function saveNotesAssignment(cls: string, sec: string, subjects: Record<string,{student_id:string;student_name:string}>) { try { await setDoc(doc(db,'settings',`notes_student_${cls.toUpperCase()}_${sec.toUpperCase()}`),{class:cls.toUpperCase(),section:sec.toUpperCase(),subjects,updatedAt:Timestamp.now()},{merge:true}); return true; } catch(e) { return false; } }
export async function verifyManagement(code: string, pass: string): Promise<boolean> { try { const d = await getDoc(doc(db,'settings','management')); if(d.exists()) { const dt = d.data(); return dt.security_code===code && dt.password===pass; } return false; } catch(e) { return false; } }
export async function saveManagement(code: string, pass: string) { try { await setDoc(doc(db,'settings','management'),{security_code:code,password:pass,updatedAt:Timestamp.now()}); return true; } catch(e) { return false; } }
