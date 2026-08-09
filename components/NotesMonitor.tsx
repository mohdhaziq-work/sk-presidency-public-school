'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  getNotesBySubject, getNotesByClassSection, addNote, deleteNote, getMyNotes,
  getCurriculumByClass, getNoticesByClassSection, getNotesAssignment,
  type NoteSubmission, type NoteFile, type SubjectCurriculum,
} from '@/lib/firebase/firestore';

// ── SUBJECT ICONS ────────────────────────────────────────
const SUBJ_COLORS: Record<string, [string, string]> = {
  English: ['#DBEAFE','#1E40AF'], Hindi: ['#D1FAE5','#065F46'],
  Maths: ['#FEF3C7','#92400E'], Science: ['#FEE2E2','#991B1B'],
  'Social Studies': ['#EDE9FE','#5B21B6'], Sanskrit: ['#E0E7FF','#3730A3'],
  Computer: ['#FFEDD5','#9A3412'], AI: ['#FCE7F3','#9D174D'],
  'Physical Education': ['#CCFBF1','#134E4A'], Art: ['#F3E8FF','#6B21A8'],
  Music: ['#FEF9C3','#854D0E'], 'General Knowledge': ['#E0F2FE','#075985'],
};

function SubjIcon({name}:{name:string}){ 
  const [bg,fg]=SUBJ_COLORS[name]||['#F1F5F9','#475569'];
  return <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold" style={{background:bg,color:fg}}>{name.charAt(0)}</div>;
}

// ── COMPONENT ────────────────────────────────────────────
export default function NotesMonitor() {
  const { studentProfile, user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'browse'|'upload'|'my'>('browse');
  const [subject, setSubject] = useState('');
  const [allNotes, setAllNotes] = useState<NoteSubmission[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteSubmission[]>([]);
  const [curriculum, setCurriculum] = useState<SubjectCurriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingNote, setViewingNote] = useState<NoteSubmission|null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);

  // Upload form
  const [showUpload, setShowUpload] = useState(false);
  const [upSubject, setUpSubject] = useState('');
  const [upType, setUpType] = useState<'Notes'|'Homework'>('Notes');
  const [upChapter, setUpChapter] = useState('');
  const [upTitle, setUpTitle] = useState('');
  const [upContent, setUpContent] = useState('');
  const [upFiles, setUpFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cls = studentProfile?.class || '';
  const sec = studentProfile?.section || '';
  const sid = studentProfile?.id || user?.uid || '';

  const isAssignedForSubject = useCallback((sub: string) => {
    return assignedSubjects.includes(sub);
  }, [assignedSubjects]);

  const loadData = useCallback(async () => {
    if (!cls) return;
    setLoading(true);
    const [notes, curr, notices, assignments] = await Promise.all([
      getNotesByClassSection(cls, sec),
      getCurriculumByClass(cls),
      getNoticesByClassSection(cls, sec),
      getNotesAssignment(cls, sec),
    ]);
    setAllNotes([...notes, ...notices]);
    setCurriculum(curr);
    const myAssigned: string[] = [];
    if (assignments) {
      Object.entries(assignments).forEach(([k, v]: [string, any]) => {
        if (v.student_id === sid) myAssigned.push(k);
      });
    }
    setAssignedSubjects(myAssigned);
    setLoading(false);
  }, [cls, sec, sid]);

  useEffect(() => { if (cls) loadData(); }, [cls, loadData]);

  useEffect(() => {
    if (subject) {
      setFilteredNotes(allNotes.filter(n => n.subject === subject));
    } else {
      setFilteredNotes(allNotes.filter(n => n.type !== 'Notice'));
    }
  }, [subject, allNotes]);

  // ── Chapter grouping ──
  const chapters = () => {
    const map: Record<string, NoteSubmission[]> = {};
    filteredNotes.forEach(n => {
      const ch = n.chapter || n.title || 'General';
      if (!map[ch]) map[ch] = [];
      map[ch].push(n);
    });
    return Object.entries(map);
  };

  const subjects = curriculum.length ? curriculum : 
    [...new Set(allNotes.map(n => n.subject))].map(s => ({ id: s, class: cls, name: s, chapters: [] } as SubjectCurriculum));

  // ── File Upload ──
  const uploadFiles = async (files: File[]): Promise<NoteFile[]> => {
    const results: NoteFile[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.error) {
          results.push({
            url: data.url, thumb: data.thumb || data.url,
            originalName: data.originalName || file.name,
            size: data.size || file.size,
            source: data.source || 'base64', type: data.type || file.type,
          });
        }
      } catch (e) { /* skip failed */ }
    }
    return results;
  };

  const handleUpload = async () => {
    if (!upTitle.trim()) { alert('Enter a title'); return; }
    if (upFiles.length === 0 && !upContent.trim()) { alert('Add content or files'); return; }
    setUploading(true);
    try {
      const uploadedFiles = await uploadFiles(upFiles);
      const curSubject = curriculum.find(c => c.name === upSubject);
      await addNote({
        studentId: sid, studentName: studentProfile?.name || 'Student',
        class: cls, section: sec, subject: upSubject, type: upType,
        chapter: upChapter || upTitle, title: upTitle, content: upContent || 'See attached',
        files: uploadedFiles,
      });
      setShowUpload(false); setUpFiles([]); setUpTitle(''); setUpContent(''); setUpChapter('');
      loadData();
    } catch (e) { alert('Upload failed'); }
    setUploading(false);
  };

  if (authLoading || loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"/></div>;
  if (!studentProfile) return <div className="text-center py-16 text-gray-500">No student profile found. Contact management.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">Notes & Homework</h1>
        <p className="text-xs text-gray-400 mt-1">Class {cls}-{sec} | {studentProfile.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(['browse','upload','my'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'browse' ? 'Browse' : t === 'upload' ? 'Upload' : 'My Uploads'}
          </button>
        ))}
      </div>

      {/* BROWSE TAB */}
      {tab === 'browse' && (
        <>
          {/* Subject grid */}
          {!subject ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {subjects.map((s, i) => {
                const count = allNotes.filter(n => n.subject === s.name).length;
                return (
                  <button key={i} onClick={() => setSubject(s.name)}
                    className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1">
                    <SubjIcon name={s.name} />
                    <div className="font-semibold text-sm mt-2">{s.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{count} items{s.book ? ` | ${s.book}` : ''}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <button onClick={() => setSubject('')} className="text-xs font-semibold text-blue-600 mb-4 inline-flex items-center gap-1">&larr; All Subjects</button>
              <h3 className="text-lg font-bold mb-1">{subject}</h3>
              <p className="text-xs text-gray-400 mb-4">{chapters().length} chapters | {filteredNotes.length} items</p>

              {/* Chapter cards horizontal scroll */}
              <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
                {chapters().map(([ch, notes]) => (
                  <button key={ch} onClick={() => setViewingNote(notes[0])}
                    className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-300 transition">
                    <div className="h-20 bg-gray-100 flex items-center justify-center text-2xl text-gray-300">
                      {notes[0]?.files?.[0]?.thumb ? <img src={notes[0].files[0].thumb} className="w-full h-full object-cover" alt=""/> : '📄'}
                    </div>
                    <div className="p-2.5"><div className="text-xs font-semibold truncate">{ch}</div><div className="text-[10px] text-gray-400">{notes.length} items</div></div>
                  </button>
                ))}
              </div>

              {/* Notes list */}
              <div className="space-y-2">
                {filteredNotes.map(n => (
                  <div key={n.id} onClick={() => setViewingNote(n)}
                    className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition">
                    <div className="flex justify-between items-start gap-2">
                      <strong className="text-sm">{n.title}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${n.type==='Homework'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{n.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content?.substring(0,150)}</p>
                    {n.files?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {n.files.slice(0,4).map((f,i) => (
                          <div key={i} className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                            {f.type?.includes('image') ? <img src={f.thumb||f.url} className="w-full h-full object-cover" alt=""/> :
                              <div className="w-full h-full bg-red-50 flex items-center justify-center text-[8px] font-bold text-red-600">PDF</div>}
                          </div>
                        ))}
                        {n.files.length > 4 && <span className="text-[10px] text-gray-400 self-center">+{n.files.length-4}</span>}
                      </div>
                    )}
                    <div className="flex gap-3 text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                      <span>{n.studentName}</span><span>{n.createdAt?.toDate?.()?.toLocaleDateString() || ''}</span>
                    </div>
                  </div>
                ))}
                {filteredNotes.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No notes yet for this subject.</p>}
              </div>
            </>
          )}
        </>
      )}

      {/* UPLOAD TAB */}
      {tab === 'upload' && !showUpload && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4 text-sm">Upload notes or homework for your class</p>
          <button onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/></svg>
            Upload Notes / Homework
          </button>
        </div>
      )}

      {tab === 'upload' && showUpload && (
        <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">New Upload</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Subject</label>
              <select value={upSubject} onChange={e => { setUpSubject(e.target.value); setUpChapter(''); }}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                <option value="">Select subject</option>
                {subjects.map((s,i) => <option key={i} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Type</label>
              <select value={upType} onChange={e => setUpType(e.target.value as any)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                <option value="Notes">Notes</option>
                <option value="Homework">Homework</option>
              </select>
            </div>
          </div>

          {upType === 'Notes' && upSubject && curriculum.find(c => c.name === upSubject)?.chapters?.length ? (
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Chapter</label>
              <select value={upChapter} onChange={e => setUpChapter(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">
                <option value="">Select chapter</option>
                {curriculum.find(c => c.name === upSubject)?.chapters.map((ch, i) => (
                  <option key={i} value={ch}>{ch}</option>
                ))}
                <option value="__custom__">Other (custom)</option>
              </select>
              {upChapter === '__custom__' && (
                <input value="" onChange={e => setUpChapter(e.target.value)}
                  className="w-full mt-2 p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Enter chapter name"/>
              )}
            </div>
          ) : upType === 'Notes' && (
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Chapter / Topic</label>
              <input value={upChapter} onChange={e => setUpChapter(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g. Chapter 3"/>
            </div>
          )}

          <div className="mb-3">
            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Title <span className="text-red-500">*</span></label>
            <input value={upTitle} onChange={e => setUpTitle(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Descriptive title"/>
          </div>

          {upType === 'Homework' && (
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Homework Content</label>
              <textarea value={upContent} onChange={e => setUpContent(e.target.value)} rows={4}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none" placeholder="Write the homework details..."/>
            </div>
          )}

          {upType === 'Notes' && (
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Content (optional)</label>
              <textarea value={upContent} onChange={e => setUpContent(e.target.value)} rows={3}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none" placeholder="Additional notes text..."/>
            </div>
          )}

          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Images & Files (max 50)</label>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/></svg>
              <p className="text-xs text-gray-400">Click to select images or PDFs</p>
              <p className="text-[10px] text-gray-400 mt-1">Auto-compressed on upload</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden"
              onChange={e => { if(e.target.files) setUpFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0,50)); }}/>
            {upFiles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {upFiles.map((f,i) => (
                  <div key={i} className="relative w-10 h-10 rounded overflow-hidden border border-gray-200">
                    {f.type.includes('image') ? <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt=""/> :
                      <div className="w-full h-full bg-red-50 flex items-center justify-center text-[7px] font-bold text-red-600">{f.name.slice(-6)}</div>}
                    <button onClick={() => setUpFiles(prev => prev.filter((_,j) => j!==i))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-black/60 rounded-full text-white text-[8px] flex items-center justify-center">&times;</button>
                  </div>
                ))}
                <span className="text-[10px] text-gray-400 self-center">{upFiles.length}/50</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowUpload(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleUpload} disabled={uploading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>Uploading...</> : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {/* MY UPLOADS TAB */}
      {tab === 'my' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-3">Notes uploaded by you</p>
          {allNotes.filter(n => n.studentId === sid).map(n => (
            <div key={n.id} onClick={() => setViewingNote(n)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition">
              <div className="flex justify-between items-start gap-2">
                <strong className="text-sm">{n.title}</strong>
                <div className="flex gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${n.type==='Homework'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{n.type}</span>
                  <button onClick={async e => { e.stopPropagation(); if(confirm('Delete?')){ await deleteNote(n.id!); loadData(); }}}
                    className="text-[10px] text-red-500 hover:bg-red-50 px-1.5 rounded">Del</button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{n.subject}{n.chapter ? ` | ${n.chapter}` : ''}</p>
            </div>
          ))}
          {allNotes.filter(n => n.studentId === sid).length === 0 && <p className="text-center text-gray-400 py-10 text-sm">You haven't uploaded anything yet.</p>}
        </div>
      )}

      {/* VIEWER MODAL */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingNote(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-5 py-3 flex justify-between items-center">
              <div><strong className="text-sm">{viewingNote.subject} — {viewingNote.title}</strong>
                <div className="text-[10px] text-gray-400">{viewingNote.type} | {viewingNote.studentName} | {viewingNote.createdAt?.toDate?.()?.toLocaleDateString?.() || ''}</div></div>
              <button onClick={() => setViewingNote(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-sm">&times;</button>
            </div>
            <div className="p-5">
              {viewingNote.files?.map((f,i) => (
                <div key={i} className="mb-3">
                  {f.type?.includes('image') ? <img src={f.url} className="rounded-xl max-w-full shadow-md" alt=""/> :
                    <a href={f.url} download className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-blue-600 hover:bg-gray-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></svg>
                      {f.originalName || 'Download'}
                    </a>}
                </div>
              ))}
              {viewingNote.content && viewingNote.content !== 'See attached' && (
                <div className="text-sm text-gray-700 whitespace-pre-wrap mt-3 leading-relaxed">{viewingNote.content}</div>
              )}
              {viewingNote.chapter && <div className="text-xs text-gray-400 mt-3">Chapter: {viewingNote.chapter}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
