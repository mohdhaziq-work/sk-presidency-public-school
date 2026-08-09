'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '@/lib/firebase/config';
import { getNotesByClassSection, getCurriculum, getNotices, addNote, getNotesAssignment, type NoteSubmission, type SubjectCurriculum, type StudentProfile } from '@/lib/firebase/firestore';
import Link from 'next/link';

const SUBJ_COLORS: Record<string,[string,string]>={
  English:['#DBEAFE','#1E40AF'],Hindi:['#D1FAE5','#065F46'],Maths:['#FEF3C7','#92400E'],Science:['#FEE2E2','#991B1B'],
  'Social Studies':['#EDE9FE','#5B21B6'],Sanskrit:['#E0E7FF','#3730A3'],Computer:['#FFEDD5','#9A3412'],AI:['#FCE7F3','#9D174D'],
  'Physical Education':['#CCFBF1','#134E4A'],Art:['#F3E8FF','#6B21A8'],Music:['#FEF9C3','#854D0E'],'General Knowledge':['#E0F2FE','#075985'],
};

type TabType = 'home'|'profile'|'notices'|'notes'|'links';

export default function StudentDashboard({ profile, uid }: { profile: StudentProfile; uid: string }) {
  const [tab, setTab] = useState<TabType>('home');
  const [notes, setNotes] = useState<NoteSubmission[]>([]);
  const [curriculum, setCurriculum] = useState<SubjectCurriculum[]>([]);
  const [subject, setSubject] = useState('');
  const [viewingNote, setViewingNote] = useState<NoteSubmission|null>(null);

  const cls = (profile.class||'').toUpperCase();
  const sec = (profile.section||'A').toUpperCase();

  const loadAll = useCallback(async (): Promise<void> => {
    const [n, c, nt] = await Promise.all([getNotesByClassSection(cls,sec), getCurriculum(cls), getNotices(cls,sec)]);
    setNotes([...n, ...nt]);
    setCurriculum(c);
  }, [cls, sec]);

  useEffect((): void => { if (cls) loadAll(); }, [cls, loadAll]);

  const filtered: NoteSubmission[] = subject ? notes.filter((n: NoteSubmission) => n.subject===subject && n.type!=='Notice') : notes.filter((n: NoteSubmission) => n.type!=='Notice');

  function getChapters(): [string, NoteSubmission[]][] {
    const m: Record<string, NoteSubmission[]> = {};
    filtered.forEach((n: NoteSubmission) => {
      const ch = n.chapter || n.title || 'General';
      if (!m[ch]) m[ch] = [];
      m[ch].push(n);
    });
    return Object.entries(m);
  }

  const subjects: SubjectCurriculum[] = curriculum.length ? curriculum :
    [...new Set(notes.map((n: NoteSubmission) => n.subject))]
      .map((s: string) => ({ id: s, class: cls, name: s, chapters: [] } as SubjectCurriculum));

  const tabs = [
    { id: 'home' as TabType, label: 'Home' },
    { id: 'profile' as TabType, label: 'Profile' },
    { id: 'notices' as TabType, label: 'Notices' },
    { id: 'notes' as TabType, label: 'Notes' },
    { id: 'links' as TabType, label: 'Links' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm">SKPPS<span className="text-[10px] text-gray-400 font-medium ml-1"> — {profile.full_name} | {cls}-{sec}</span></Link>
        <button onClick={() => auth.signOut()} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Logout</button>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Student Portal</div>
          {tabs.map((t: { id: TabType; label: string }) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 mx-2 rounded-lg text-xs font-medium transition text-left ${tab===t.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity={tab===t.id?1:.5}>
                {t.id==='home' && <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                {t.id==='profile' && <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                {t.id==='notices' && <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>}
                {t.id==='notes' && <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>}
                {t.id==='links' && <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
              </svg>{t.label}</button>
          ))}
          <div className="mt-auto p-4 border-t text-center text-[10px] text-gray-400">SK Presidency</div>
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-6 pb-20 md:pb-6">
          {tab==='home' && <HomeTab profile={profile} notes={notes.filter((n: NoteSubmission) => n.type==='Notice').slice(0,3)} onNav={setTab} />}
          {tab==='profile' && <ProfileTab profile={profile} />}
          {tab==='notices' && <NoticesTab notes={notes.filter((n: NoteSubmission) => n.type==='Notice')} />}
          {tab==='notes' && <NotesTabMain subject={subject} setSubject={setSubject} subjects={subjects} getChapters={getChapters} filtered={filtered} viewingNote={viewingNote} setViewingNote={setViewingNote} profile={profile} uid={uid} onRefresh={loadAll} />}
          {tab==='links' && <LinksTab />}
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 h-16 flex md:hidden z-40">
        {tabs.map((t: { id: TabType; label: string }) => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${tab===t.id?'text-blue-600':'text-gray-400'}`}>{t.label}</button>))}
      </nav>
      {viewingNote && <NoteViewer note={viewingNote} onClose={() => setViewingNote(null)} />}
    </div>
  );
}

function HomeTab({ profile, notes, onNav }: { profile: StudentProfile; notes: NoteSubmission[]; onNav: (t: TabType) => void }) {
  return <div>
    <h2 className="text-lg font-bold mb-1">Welcome, {profile.full_name.split(' ')[0]}</h2>
    <p className="text-xs text-gray-400 mb-6">Class {profile.class}-{profile.section||'A'} | {profile.house||'Earth'} House | Roll {profile.roll_no||'-'}</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[{v:profile.class,l:'Class'},{v:profile.house||'Earth',l:'House'},{v:profile.roll_no||'-',l:'Roll'},{v:profile.parent_phone||'-',l:'Contact'}].map((s,i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition"><div className="text-2xl font-extrabold">{s.v}</div><div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">{s.l}</div></div>
      ))}
    </div>
    <div className="bg-white border border-gray-200 rounded-xl mb-4">
      <div className="px-4 py-3 border-b font-semibold text-sm">Recent Notices</div>
      <div className="p-4">{notes.length ? notes.map((n,i) => (<div key={i} className="py-2 border-b border-gray-50 last:border-0"><strong className="text-xs">{n.title}</strong><p className="text-[11px] text-gray-500">{n.content?.substring(0,120)}</p></div>)) : <p className="text-xs text-gray-400">No notices</p>}</div>
    </div>
    <div className="flex gap-2 flex-wrap"><button onClick={()=>onNav('notes')} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">View Notes</button><Link href="/" className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg">School Website</Link></div>
  </div>;
}

function ProfileTab({ profile }: { profile: StudentProfile }) {
  const rows = [['Name',profile.full_name],['Father',profile.father_name],['Mother',profile.mother_name],['Class',`${profile.class}-${profile.section||'A'}`],['Roll',profile.roll_no],['House',profile.house],['Gender',profile.gender],['DOB',profile.date_of_birth],['Phone',profile.parent_phone],['Blood',profile.blood_group],['SR No',profile.sr_no||profile.student_id]];
  return <div>
    <h2 className="text-lg font-bold mb-4">My Profile</h2>
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex gap-5 items-start flex-wrap mb-6"><div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">{profile.full_name.charAt(0)}</div><div><h3 className="font-bold text-lg">{profile.full_name}</h3><p className="text-xs text-gray-400">{profile.class}-{profile.section||'A'}</p></div></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{rows.map(([l,v], i) => (<div key={i} className="flex gap-2 text-xs"><span className="font-semibold text-gray-400 uppercase text-[10px] w-16">{l}</span><span>{v||'-'}</span></div>))}</div>
    </div>
  </div>;
}

function NoticesTab({ notes }: { notes: NoteSubmission[] }) {
  return <div><h2 className="text-lg font-bold mb-4">Notices</h2>
    {notes.length ? <div className="space-y-3">{notes.map((n,i) => (<div key={i} className="bg-white border border-gray-200 rounded-xl p-5"><div className="flex justify-between items-start gap-2 mb-1"><strong className="text-sm">{n.title}</strong><span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Notice</span></div><p className="text-xs text-gray-500 whitespace-pre-wrap">{n.content}</p><div className="flex gap-3 text-[10px] text-gray-400 mt-3 pt-2 border-t"><span>{n.studentName||'Management'}</span><span>{n.createdAt?.toDate?.()?.toLocaleDateString()||''}</span></div></div>))}</div> : <p className="text-center text-gray-400 py-10 text-sm">No notices.</p>}
  </div>;
}

function NotesTabMain({ subject, setSubject, subjects, getChapters, filtered, viewingNote, setViewingNote, profile, uid, onRefresh }: any) {
  const [showUpload, setShowUpload] = useState(false);
  const chapters = getChapters();
  return <div>
    <h2 className="text-lg font-bold mb-4">Notes & Homework</h2>
    {!subject ? <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {subjects.map((s: any, i: number) => {
          const [bg, fg] = SUBJ_COLORS[s.name] || ['#F1F5F9', '#475569'];
          return <button key={i} onClick={() => setSubject(s.name)} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-lg hover:border-blue-300 transition hover:-translate-y-1"><div className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-extrabold" style={{background:bg,color:fg}}>{s.name.charAt(0)}</div><div className="font-semibold text-sm">{s.name}</div><div className="text-[10px] text-gray-400 mt-0.5">{s.noteCount||filtered.filter((n:any)=>n.subject===s.name).length} items</div></button>;
        })}
      </div>
      <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-4 flex-wrap"><span className="text-xs font-semibold">Upload study material</span><button onClick={()=>setShowUpload(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Upload Notes</button></div>
    </> : <>
      <button onClick={()=>setSubject('')} className="text-xs font-semibold text-blue-600 mb-4">&larr; All Subjects</button>
      <h3 className="font-bold text-lg mb-1">{subject}</h3><p className="text-xs text-gray-400 mb-4">{chapters.length} chapters | {filtered.length} items</p>
      {chapters.length>0 && <div className="flex gap-3 overflow-x-auto pb-3 mb-4">{chapters.map(([ch, ns]: any) => (<button key={ch} onClick={()=>setViewingNote(ns[0])} className="flex-shrink-0 w-36 bg-white border rounded-lg overflow-hidden hover:shadow-md transition"><div className="h-16 bg-gray-100 flex items-center justify-center">{ns[0]?.files?.[0]?.thumb ? <img src={ns[0].files[0].thumb} className="w-full h-full object-cover" alt="" /> : '📄'}</div><div className="p-2"><div className="text-[11px] font-semibold truncate">{ch}</div><div className="text-[9px] text-gray-400">{ns.length} items</div></div></button>))}</div>}
      <div className="space-y-2">{filtered.map((n: any) => (<div key={n.id} onClick={()=>setViewingNote(n)} className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md"><div className="flex justify-between"><strong className="text-sm">{n.title}</strong><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${n.type==='Homework'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{n.type}</span></div><p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content?.substring(0,150)}</p>{n.files?.length>0 && <div className="flex gap-1 mt-2">{n.files.slice(0,4).map((f:any,i:number)=>(<div key={i} className="w-9 h-9 rounded overflow-hidden">{f.type?.includes('image') ? <img src={f.thumb||f.url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-red-50 flex items-center justify-center text-[7px] font-bold text-red-600">PDF</div>}</div>))}</div>}<div className="flex gap-3 text-[10px] text-gray-400 mt-2 pt-2 border-t"><span>{n.studentName}</span><span>{n.createdAt?.toDate?.()?.toLocaleDateString()||''}</span></div></div>))}</div>
    </>}
    {showUpload && <UploadModal subjects={subjects} profile={profile} uid={uid} onClose={()=>setShowUpload(false)} onRefresh={onRefresh} />}
  </div>;
}

function UploadModal({ subjects, profile, uid, onClose, onRefresh }: any) {
  const [upSub, setUpSub] = useState(''); const [upType, setUpType] = useState('Notes');
  const [upChapter, setUpChapter] = useState(''); const [upTitle, setUpTitle] = useState('');
  const [upContent, setUpContent] = useState(''); const [upFiles, setUpFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false); const fileRef = useRef<HTMLInputElement>(null);
  const curSubObj = subjects.find((c:any) => c.name===upSub);
  const hasChapters = curSubObj?.chapters?.length > 0;

  const doUpload = async () => {
    if (!upTitle.trim()) { alert('Enter a title'); return; }
    setUploading(true);
    const files: any[] = [];
    for (const f of upFiles) {
      const fd = new FormData(); fd.append('file', f);
      try { const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json(); if (!d.error) files.push({url:d.url,thumb:d.thumb||d.url,originalName:d.originalName||f.name,size:d.size,source:d.source,type:d.type}); } catch(e) {}
    }
    await addNote({studentId:uid,studentName:profile.full_name,class:profile.class.toUpperCase(),section:(profile.section||'A').toUpperCase(),subject:upSub,type:upType as any,chapter:upChapter||upTitle,title:upTitle,content:upContent||'See attached',files});
    onClose(); onRefresh();
  };

  return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between"><h3 className="font-bold">Upload Notes / Homework</h3><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">&times;</button></div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Subject</label><select value={upSub} onChange={e=>{setUpSub(e.target.value);setUpChapter('')}} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"><option value="">Select</option>{subjects.map((s:any,i:number)=><option key={i} value={s.name}>{s.name}</option>)}</select></div>
          <div><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Type</label><select value={upType} onChange={e=>setUpType(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"><option>Notes</option><option>Homework</option></select></div>
        </div>
        {upType==='Notes' && upSub && hasChapters ? <div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Chapter</label><select value={upChapter} onChange={e=>{if(e.target.value==='__custom__')setUpChapter('');else setUpChapter(e.target.value)}} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"><option value="">Select</option>{curSubObj?.chapters.map((ch:string,i:number)=><option key={i} value={ch}>{ch}</option>)}<option value="__custom__">Other</option></select></div> : upType==='Notes' ? <div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Chapter</label><input value={upChapter} onChange={e=>setUpChapter(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50" placeholder="e.g. Chapter 3"/></div> : null}
        <div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Title *</label><input value={upTitle} onChange={e=>setUpTitle(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50" placeholder="Descriptive title"/></div>
        {upType==='Homework' ? <div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Homework Content</label><textarea value={upContent} onChange={e=>setUpContent(e.target.value)} rows={4} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 resize-none" placeholder="Write homework..."/></div> : <div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Content (optional)</label><textarea value={upContent} onChange={e=>setUpContent(e.target.value)} rows={3} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 resize-none" placeholder="Additional notes..."/></div>}
        <div className="mb-4"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Files (max 50)</label><div onClick={()=>fileRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" className="mx-auto mb-1"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/></svg><p className="text-xs text-gray-400">Click to select images/PDFs</p></div><input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={e=>{if(e.target.files) setUpFiles((p:File[]) => [...p, ...Array.from(e.target.files!)].slice(0,50))}}/>
        {upFiles.length>0 && <div className="flex flex-wrap gap-1 mt-2">{upFiles.map((f,i)=>(<div key={i} className="relative w-9 h-9 rounded overflow-hidden border">{f.type.includes('image')?<img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt=""/>:<div className="w-full h-full bg-red-50 flex items-center justify-center text-[6px] font-bold text-red-600">PDF</div>}<button onClick={()=>setUpFiles((p:File[])=>p.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black/60 rounded-full text-white text-[7px] flex items-center justify-center">&times;</button></div>))}<span className="text-[9px] text-gray-400 self-center">{upFiles.length}/50</span></div>}</div>
        <div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2.5 border rounded-xl text-sm font-semibold">Cancel</button><button onClick={doUpload} disabled={uploading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">{uploading?'Uploading...':'Upload'}</button></div>
      </div>
    </div>
  </div>;
}

function NoteViewer({ note, onClose }: { note: NoteSubmission; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
    <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b px-5 py-3 flex justify-between items-center"><div><strong className="text-sm">{note.subject} — {note.title}</strong><div className="text-[10px] text-gray-400">{note.type} | {note.createdAt?.toDate?.()?.toLocaleDateString()||''}</div></div><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">&times;</button></div>
    <div className="p-5">{note.files?.map((f:any,i:number)=>(<div key={i} className="mb-3">{f.type?.includes('image')?<img src={f.url} className="rounded-xl max-w-full shadow-md" alt=""/>:<a href={f.url} download className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-blue-600">📎 {f.originalName}</a>}</div>))}{note.content && note.content!=='See attached' && <div className="text-sm text-gray-700 whitespace-pre-wrap mt-3">{note.content}</div>}</div>
  </div></div>;
}

function LinksTab() {
  const links = [{href:'/',t:'School Website',s:'Main homepage',c:'#2563EB'},{href:'/noticeboard',t:'Noticeboard',s:'Latest',c:'#059669'},{href:'/fees',t:'Fees',s:'Details',c:'#D97706'},{href:'/calendar',t:'Calendar',s:'Schedule',c:'#7C3AED'}];
  return <div><h2 className="text-lg font-bold mb-4">Quick Links</h2><div className="grid gap-3 max-w-lg">{links.map((l,i) => (<Link key={i} href={l.href} className="flex items-center gap-3 p-4 bg-white border rounded-xl hover:shadow-md transition"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:l.c+'15',color:l.c}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><div><div className="font-semibold text-sm">{l.t}</div><div className="text-[11px] text-gray-400">{l.s}</div></div><span className="ml-auto text-gray-300">&rarr;</span></Link>))}</div></div>;
}
