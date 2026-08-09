import { db, isConfigured } from './config';
import {
  collection, addDoc, getDocs, getDoc, query, where,
  orderBy, deleteDoc, doc, updateDoc, Timestamp, limit, setDoc
} from 'firebase/firestore';

// ── TYPES ───────────────────────────────────────────────────
export interface NoteFile {
  url: string;
  thumb?: string;
  originalName: string;
  size: number;
  source: 'imgbb' | 'base64' | 'storage';
  type: string;
}

export interface NoteSubmission {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  subject: string;
  type: 'Notes' | 'Homework' | 'Notice';
  chapter?: string;
  title: string;
  content: string;
  files: NoteFile[];
  createdAt: any;
  updatedAt: any;
}

export interface StudentProfile {
  id: string;
  full_name: string;
  student_id: string;
  class: string;
  section: string;
  roll_no: string;
  house: string;
  gender: string;
  date_of_birth: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  blood_group: string;
  sr_no: string;
  photoURL?: string;
  is_active: boolean;
}

export interface TeacherProfile {
  id: string;
  full_name: string;
  username: string;
  class?: string;
  section?: string;
  email?: string;
}

export interface SubjectCurriculum {
  id: string;
  class: string;
  name: string;
  book?: string;
  publisher?: string;
  chapters: string[];
}

// ── NOTES CRUD ────────────────────────────────────────
export async function addNote(data: Omit<NoteSubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  if (!isConfigured || !db) return null;
  try {
    const docRef = await addDoc(collection(db, 'notes'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (e) { console.error('addNote error:', e); return null; }
}

export async function getNotesByClassSection(cls: string, section: string): Promise<NoteSubmission[]> {
  if (!isConfigured || !db) return [];
  try {
    const qry = query(
      collection(db, 'notes'),
      where('class', '==', cls.toUpperCase()),
      where('section', '==', section.toUpperCase()),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    const snap = await getDocs(qry);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as NoteSubmission[];
  } catch (e) { console.error('getNotesByClassSection error:', e); return []; }
}

export async function getNotesBySubject(cls: string, section: string, subject: string): Promise<NoteSubmission[]> {
  if (!isConfigured || !db) return [];
  try {
    const qry = query(
      collection(db, 'notes'),
      where('class', '==', cls.toUpperCase()),
      where('section', '==', section.toUpperCase()),
      where('subject', '==', subject),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    const snap = await getDocs(qry);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as NoteSubmission[];
  } catch (e) { console.error('getNotesBySubject error:', e); return []; }
}

export async function getNoticesByClassSection(cls: string, section: string): Promise<NoteSubmission[]> {
  if (!isConfigured || !db) return [];
  try {
    const qry = query(
      collection(db, 'notes'),
      where('class', '==', cls.toUpperCase()),
      where('section', '==', section.toUpperCase()),
      where('type', '==', 'Notice'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(qry);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as NoteSubmission[];
  } catch (e) { console.error('getNotices error:', e); return []; }
}

export async function getMyNotes(studentId: string): Promise<NoteSubmission[]> {
  if (!isConfigured || !db) return [];
  try {
    const qry = query(
      collection(db, 'notes'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    const snap = await getDocs(qry);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as NoteSubmission[];
  } catch (e) { console.error('getMyNotes error:', e); return []; }
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try { await deleteDoc(doc(db, 'notes', id)); return true; }
  catch (e) { console.error('deleteNote error:', e); return false; }
}

// ── STUDENTS CRUD ────────────────────────────────────────
export async function getStudentsByClass(cls: string, section?: string): Promise<StudentProfile[]> {
  if (!isConfigured || !db) return [];
  try {
    let qry = query(collection(db, 'students'), where('class', '==', cls.toUpperCase()), limit(200));
    if (section) qry = query(qry, where('section', '==', section.toUpperCase()));
    const snap = await getDocs(qry);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentProfile));
  } catch (e) { console.error('getStudentsByClass error:', e); return []; }
}

export async function getStudentById(id: string): Promise<StudentProfile | null> {
  if (!isConfigured || !db) return null;
  try {
    const d = await getDoc(doc(db, 'students', id));
    return d.exists() ? ({ id: d.id, ...d.data() } as StudentProfile) : null;
  } catch (e) { console.error(e); return null; }
}

export async function updateStudent(id: string, updates: Partial<StudentProfile>): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try { await updateDoc(doc(db, 'students', id), updates as any); return true; }
  catch (e) { console.error('updateStudent error:', e); return false; }
}

export async function deleteStudentById(id: string): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try { await deleteDoc(doc(db, 'students', id)); return true; }
  catch (e) { console.error(e); return false; }
}

// ── TEACHERS ──────────────────────────────────────────
export async function getTeacherByUsername(username: string): Promise<TeacherProfile | null> {
  if (!isConfigured || !db) return null;
  try {
    const qry = query(collection(db, 'teachers'), where('username', '==', username), limit(1));
    const snap = await getDocs(qry);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as TeacherProfile;
    }
    return null;
  } catch (e) { console.error(e); return null; }
}

export async function addTeacher(data: Omit<TeacherProfile, 'id'>): Promise<string | null> {
  if (!isConfigured || !db) return null;
  try {
    const docRef = await addDoc(collection(db, 'teachers'), { ...data, createdAt: Timestamp.now() });
    return docRef.id;
  } catch (e) { console.error(e); return null; }
}

export async function getAllTeachers(): Promise<TeacherProfile[]> {
  if (!isConfigured || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'teachers'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeacherProfile));
  } catch (e) { return []; }
}

export async function deleteTeacher(id: string): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try { await deleteDoc(doc(db, 'teachers', id)); return true; } catch (e) { return false; }
}

// ── CURRICULUM ──────────────────────────────────────────
export async function getCurriculumByClass(cls: string): Promise<SubjectCurriculum[]> {
  if (!isConfigured || !db) return [];
  try {
    const qry = query(collection(db, 'curriculum'), where('class', '==', cls.toUpperCase()), limit(100));
    const snap = await getDocs(qry);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubjectCurriculum));
  } catch (e) { return []; }
}

export async function addCurriculum(data: Omit<SubjectCurriculum, 'id'>): Promise<string | null> {
  if (!isConfigured || !db) return null;
  try { const docRef = await addDoc(collection(db, 'curriculum'), data); return docRef.id; }
  catch (e) { return null; }
}

export async function updateCurriculum(id: string, updates: Partial<SubjectCurriculum>): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try { await updateDoc(doc(db, 'curriculum', id), updates as any); return true; }
  catch (e) { return false; }
}

export async function deleteCurriculum(id: string): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try { await deleteDoc(doc(db, 'curriculum', id)); return true; } catch (e) { return false; }
}

// ── SETTINGS / NOTES ASSIGNMENT ──────────────────────────
export async function getNotesAssignment(cls: string, section: string): Promise<Record<string, { student_id: string; student_name: string }>> {
  if (!isConfigured || !db) return {};
  try {
    const d = await getDoc(doc(db, 'settings', `notes_student_${cls.toUpperCase()}_${section.toUpperCase()}`));
    return d.exists() ? (d.data().subjects || {}) : {};
  } catch (e) { return {}; }
}

export async function saveNotesAssignment(cls: string, section: string, subjects: Record<string, { student_id: string; student_name: string }>): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try {
    await setDoc(doc(db, 'settings', `notes_student_${cls.toUpperCase()}_${section.toUpperCase()}`), {
      class: cls.toUpperCase(), section: section.toUpperCase(), subjects, updatedAt: Timestamp.now()
    }, { merge: true });
    return true;
  } catch (e) { return false; }
}

// ── MANAGEMENT AUTH ──────────────────────────────────────────
export async function verifyManagement(code: string, pass: string): Promise<boolean> {
  if (!isConfigured || !db) return false;
  try {
    const d = await getDoc(doc(db, 'settings', 'management'));
    if (d.exists()) {
      const data = d.data();
      return data.security_code === code && data.password === pass;
    }
    return false;
  } catch (e) { return false; }
}
