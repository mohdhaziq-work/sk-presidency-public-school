'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/config';
import { signInAnonymously } from 'firebase/auth';
import {
  getTeacherByUsername, verifyManagement, getStudentsByClass, getAllTeachers,
  addTeacher, deleteTeacher, getCurriculum, addCurriculum, deleteCurriculum,
  addNote, getNotesAssignment, saveNotesAssignment, updateStudent, saveManagement,
  type TeacherProfile, type StudentProfile, type SubjectCurriculum,
} from '@/lib/firebase/firestore';
import Link from 'next/link';

const CLASSES=['NURSERY','LKG','UKG','1ST','2ND','3RD','4TH','5TH','6TH','7TH','8TH','9TH','10TH','11TH','12TH'];

export default function StaffPortal() {
  const [mode, setMode]=useState<'teacher'|'mgmt'>('teacher');
  const [user, setUser]=useState<any>(null);
  const [uname, setUname]=useState(''); const [pword, setPword]=useState('');
  const [code, setCode]=useState(''); const [mpass, setMpass]=useState('');
  const [err, setErr]=useState(''); const [loading, setLoading]=useState(false);

  const doLogin=async(e:React.FormEvent)=>{e.preventDefault();setErr('');setLoading(true);
    try{await signInAnonymously(auth);
      if(mode==='teacher'){if(!uname||!pword){setErr('Fill all fields');setLoading(false);return}
        const t=await getTeacherByUsername(uname);if(!t||t.password!==pword){setErr('Invalid credentials');setLoading(false);return}
        setUser({role:'teacher',id:t.id,name:t.full_name,class:t.class||'',section:t.section||'',teacher:t});}
      else{if(!code||!mpass){setErr('Fill all fields');setLoading(false);return}
        const fireOk=await verifyManagement(code,mpass);const hardOk=code==='Haziq1962'&&mpass==='Haziq1962';
        if(!fireOk&&!hardOk){setErr('Invalid credentials');setLoading(false);return}
        setUser({role:'mgmt',name:'Management'});}}catch(e:any){setErr(e.message)}setLoading(false);};

  if(user)return<Dashboard data={user} onLogout={()=>{setUser(null);auth.signOut()}}/>;
  return(<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50/30 px-4 bg-dots"><div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl p-8 shadow-xl animate-[scaleIn_.5s_ease]">
    <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-blue-600 mb-4 inline-block">&larr; Back</Link>
    <div className="text-center mb-6"><div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-3"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h1 className="text-xl font-extrabold">Staff Portal</h1><p className="text-xs text-gray-400 mt-1">Teacher & Management Access</p></div>
    <div className="flex bg-gray-100 rounded-lg p-0.5 mb-5"><button onClick={()=>{setMode('teacher');setErr('')}} className={`flex-1 py-2 rounded-md text-xs font-semibold transition ${mode==='teacher'?'bg-white shadow-sm':'text-gray-500'}`}>Teacher</button><button onClick={()=>{setMode('mgmt');setErr('')}} className={`flex-1 py-2 rounded-md text-xs font-semibold transition ${mode==='mgmt'?'bg-white text-red-600 shadow-sm':'text-gray-500'}`}>Management</button></div>
    {mode==='mgmt'&&<div className="flex items-center justify-center gap-1.5 p-2.5 bg-red-50 rounded-lg mb-4 text-[10px] font-semibold text-red-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Restricted Access</div>}
    {err&&<div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">{err}</div>}
    <form onSubmit={doLogin}>{mode==='teacher'?<><div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Username</label><input value={uname} onChange={e=>setUname(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Enter username"/></div><div className="mb-4"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Password</label><input type="password" value={pword} onChange={e=>setPword(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Password"/></div></>:<><div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Security Code</label><input type="password" value={code} onChange={e=>setCode(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Security code"/></div><div className="mb-4"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Password</label><input type="password" value={mpass} onChange={e=>setMpass(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" placeholder="Password"/></div></>}
      <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition active:scale-[0.98]">{loading?'Signing...':'Sign In'}</button>
    </form>
  </div></div>);
}

function Dashboard({data,onLogout}:{data:any;onLogout:()=>void}){
  const [tab,setTab]=useState('home');const isMgmt=data.role==='mgmt';
  const tabs=isMgmt?['home','students','teachers','curriculum','notices','settings']:['home','students','assign','notices','curriculum'];

  return(<div className="min-h-screen bg-gray-50">
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
      <Link href="/" className="flex items-center gap-2 font-bold text-sm">{isMgmt?'Management':'Staff'}<span className="text-[10px] text-gray-400 font-medium ml-1">— {data.name}</span></Link>
      <button onClick={onLogout} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Logout</button>
    </header>
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-48 flex-shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]">
        <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">{isMgmt?'Admin Panel':'Staff Portal'}</div>
        {tabs.map(t=>(<button key={t} onClick={()=>setTab(t)} className={`flex items-center gap-2 px-4 py-2.5 mx-2 rounded-lg text-xs font-medium transition-all text-left ${tab===t?'bg-blue-50 text-blue-600':'text-gray-500 hover:bg-gray-50'}`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>))}
        <div className="mt-auto p-4 border-t text-center text-[10px] text-gray-400">SK Presidency</div>
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-6 pb-20 md:pb-6">
        {tab==='home'&&<p className="text-lg font-bold mb-4">Welcome, {data.name}</p>}
        {tab==='students'&&<StudentsPanel cls={data.class} sec={data.section} isMgmt={isMgmt}/>}
        {tab==='teachers'&&isMgmt&&<TeachersPanel/>}
        {tab==='assign'&&!isMgmt&&<AssignPanel cls={data.class} sec={data.section} name={data.name}/>}
        {tab==='notices'&&<NoticePanel cls={data.class} sec={data.section} name={data.name} isMgmt={isMgmt}/>}
        {tab==='curriculum'&&<CurriculumPanel cls={isMgmt?'':data.class} isMgmt={isMgmt}/>}
        {tab==='settings'&&isMgmt&&<SettingsPanel/>}
      </main>
    </div>
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 h-16 flex md:hidden z-40">{tabs.slice(0,5).map(t=>(<button key={t} onClick={()=>setTab(t)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-semibold ${tab===t?'text-blue-600':'text-gray-400'}`}>{t}</button>))}</nav>
  </div>);
}

function StudentsPanel({cls,sec,isMgmt}:{cls:string;sec:string;isMgmt:boolean}){
  const [students,setStudents]=useState<StudentProfile[]>([]);const [loading,setLoading]=useState(true);
  const [edit,setEdit]=useState<StudentProfile|null>(null);
  useEffect(()=>{(async()=>{if(isMgmt){const s=await import('@/lib/firebase/firestore');const all=await s.getStudentsByClass('','');setStudents(all)}else if(cls)setStudents(await getStudentsByClass(cls.toUpperCase(),sec?.toUpperCase()));setLoading(false)})()},[cls,sec,isMgmt]);
  if(loading)return<div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mt-8"/>;
  return(<div><h2 className="text-lg font-bold mb-4">Students ({students.length})</h2>
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-gray-50"><tr>{['Name','Class','Sec','Roll','House','Phone'].map(h=><th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-gray-400">{h}</th>)}<th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-gray-400">Edit</th></tr></thead><tbody>{students.map(s=>(<tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 font-medium">{s.full_name}</td><td className="px-3 py-2">{s.class}</td><td className="px-3 py-2">{s.section||'A'}</td><td className="px-3 py-2">{s.roll_no||'-'}</td><td className="px-3 py-2">{s.house||'-'}</td><td className="px-3 py-2">{s.parent_phone||'-'}</td><td className="px-3 py-2"><button onClick={()=>setEdit(s)} className="text-blue-600 font-semibold hover:underline text-[11px]">Edit</button></td></tr>))}</tbody></table></div></div>
    {edit&&<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setEdit(null)}><div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between"><h3 className="font-bold">Edit: {edit.full_name}</h3><button onClick={()=>setEdit(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">&times;</button></div><div className="p-5 grid grid-cols-2 gap-3">{['full_name','class','section','roll_no','house','gender','date_of_birth','father_name','mother_name','parent_phone','blood_group','student_id'].map(f=>(<div key={f}><label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">{f.replace(/_/g,' ')}</label><input value={(edit as any)[f]||''} onChange={e=>setEdit({...edit,[f]:e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs"/></div>))}</div><div className="sticky bottom-0 bg-white border-t px-5 py-3 flex gap-2"><button onClick={()=>setEdit(null)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button><button onClick={async()=>{await updateStudent(edit.id, edit);setEdit(null);setLoading(true);if(isMgmt){const s=await import('@/lib/firebase/firestore');setStudents(await s.getStudentsByClass('',''))}else setStudents(await getStudentsByClass(cls.toUpperCase(),sec?.toUpperCase()));setLoading(false)}} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Save</button></div></div></div>}
  </div>);
}

function TeachersPanel(){
  const [teachers,setTeachers]=useState<TeacherProfile[]>([]);const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);const [nt,setNt]=useState({full_name:'',username:'',password:'',class:'',section:'A'});
  useEffect(()=>{(async()=>{setTeachers(await getAllTeachers());setLoading(false)})()},[]);
  const doAdd=async()=>{await addTeacher(nt);setShowAdd(false);setNt({full_name:'',username:'',password:'',class:'',section:'A'});setTeachers(await getAllTeachers());};
  return(<div><h2 className="text-lg font-bold mb-4">Teachers</h2><button onClick={()=>setShowAdd(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">Add Teacher</button>
    <div className="bg-white border rounded-xl overflow-hidden"><table className="w-full text-xs"><thead className="bg-gray-50"><tr>{['Name','Username','Class','Sec'].map(h=><th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-gray-400">{h}</th>)}<th className="px-3 py-2.5">Actions</th></tr></thead><tbody>{teachers.map(t=>(<tr key={t.id} className="border-t border-gray-100"><td className="px-3 py-2 font-medium">{t.full_name}</td><td className="px-3 py-2">{t.username}</td><td className="px-3 py-2">{t.class||'-'}</td><td className="px-3 py-2">{t.section||'-'}</td><td className="px-3 py-2"><button onClick={async()=>{await deleteTeacher(t.id);setTeachers(teachers.filter(x=>x.id!==t.id))}} className="text-red-500 font-semibold text-[11px]">Del</button></td></tr>))}</tbody></table></div>
    {showAdd&&<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"><h3 className="font-bold mb-4">Add Teacher</h3>{['full_name','username','password'].map(f=>(<div key={f} className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">{f}</label><input value={(nt as any)[f]} onChange={e=>setNt({...nt,[f]:e.target.value})} className="w-full p-2 border rounded-lg text-sm"/></div>))}<div className="grid grid-cols-2 gap-3 mb-4"><div><label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Class</label><select value={nt.class} onChange={e=>setNt({...nt,class:e.target.value})} className="w-full p-2 border rounded-lg text-sm"><option value="">None</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div><label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Section</label><select value={nt.section} onChange={e=>setNt({...nt,section:e.target.value})} className="w-full p-2 border rounded-lg text-sm">{['A','B','C'].map(s=><option key={s} value={s}>{s}</option>)}</select></div></div><div className="flex gap-2"><button onClick={()=>setShowAdd(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button><button onClick={doAdd} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Add</button></div></div></div>}
  </div>);
}

function AssignPanel({cls,sec,name}:{cls:string;sec:string;name:string}){
  const [st,setSt]=useState<any[]>([]);const [sub,setSub]=useState<any[]>([]);const [asgn,setAsgn]=useState<Record<string,string>>({});
  useEffect(()=>{(async()=>{if(!cls)return;setSt(await getStudentsByClass(cls.toUpperCase(),sec?.toUpperCase()));const c=await getCurriculum(cls.toUpperCase());setSub(c.length?c:[{name:'English'},{name:'Hindi'},{name:'Maths'},{name:'Science'},{name:'Social Studies'},{name:'Sanskrit'},{name:'Computer'},{name:'AI'}]);const a=await getNotesAssignment(cls.toUpperCase(),sec?.toUpperCase()||'A');const m:Record<string,string>={};Object.entries(a).forEach(([k,v]:any)=>{m[k]=v.student_id||''});setAsgn(m)})()},[cls,sec]);
  return(<div><h2 className="text-lg font-bold mb-4">Assign Notes Duty</h2><div className="space-y-3">{sub.map((s:any)=>(<div key={s.name} className="bg-white border rounded-xl p-4"><div className="font-semibold text-sm mb-2">{s.name}</div><select value={asgn[s.name]||''} onChange={e=>setAsgn({...asgn,[s.name]:e.target.value})} className="w-full p-2.5 border rounded-lg text-sm"><option value="">— Select student —</option>{st.map((stu:any)=><option key={stu.id} value={stu.student_id||stu.id}>{stu.full_name} (Roll {stu.roll_no||'-'})</option>)}</select></div>))}</div><button onClick={async()=>{const s2:Record<string,{student_id:string;student_name:string}>={};Object.entries(asgn).forEach(([k,v])=>{if(v){const f=st.find(x=>(x.student_id||x.id)===v);s2[k]={student_id:v,student_name:f?.full_name||''}}});await saveNotesAssignment(cls.toUpperCase(),sec?.toUpperCase()||'A',s2);alert('Saved!')}} className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save</button></div>);
}

function NoticePanel({cls,sec,name,isMgmt}:any){
  const [cl,setCl]=useState(cls||'');const [sc,setSc]=useState(sec||'A');
  const [title,setTitle]=useState('');const [content,setContent]=useState('');
  const doSend=async()=>{if(!title||!content){alert('Fill fields');return}
    if(isMgmt){if(cl==='ALL'){const s=await import('@/lib/firebase/firestore');const all=await s.getStudentsByClass('','');const seen=new Set<string>();all.forEach((x:any)=>{const k=`${(x.class||'').toUpperCase()}|${(x.section||'A').toUpperCase()}`;if(!seen.has(k))seen.add(k)});for(const k of seen){const[pcls,psec]=k.split('|');await addNote({studentId:'mgmt',studentName:'Management',class:pcls,section:psec,subject:'General',type:'Notice',title,content,files:[]})}alert('Sent!')}else{const secs=sc==='ALL'?['A','B','C']:[sc||'A'];for(const s of secs)await addNote({studentId:'mgmt',studentName:'Management',class:cl.toUpperCase(),section:s,subject:'General',type:'Notice',title,content,files:[]});alert('Sent!')}}else{await addNote({studentId:'teacher',studentName:name,class:cls.toUpperCase(),section:sec?.toUpperCase()||'A',subject:'General',type:'Notice',title,content,files:[]});alert('Sent!')}setTitle('');setContent('')};
  return(<div><h2 className="text-lg font-bold mb-4">Send Notice</h2><div className="bg-white border rounded-xl p-6 max-w-lg">
    {isMgmt&&<div className="grid grid-cols-2 gap-3 mb-3"><div><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Class</label><select value={cl} onChange={e=>setCl(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm"><option value="ALL">All</option>{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div><div><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Section</label><select value={sc} onChange={e=>setSc(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm"><option value="ALL">All</option><option>A</option><option>B</option><option>C</option></select></div></div>}
    <div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" placeholder="Notice title"/></div>
    <div className="mb-4"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Content</label><textarea value={content} onChange={e=>setContent(e.target.value)} rows={4} className="w-full p-2.5 border rounded-lg text-sm resize-none" placeholder="Notice content"/></div>
    <button onClick={doSend} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Send</button>
  </div></div>);
}

function CurriculumPanel({cls,isMgmt}:{cls:string;isMgmt:boolean}){
  const [cl,setCl]=useState(cls||'10TH');const [cur,setCur]=useState<SubjectCurriculum[]>([]);
  const [showAdd,setShowAdd]=useState(false);const [nc,setNc]=useState({name:'',book:'',publisher:'',chapters:''});
  useEffect(()=>{(async()=>{if(cl)setCur(await getCurriculum(cl.toUpperCase()))})()},[cl]);
  const doAdd=async()=>{const ch=nc.chapters.split(/[\n,]+/).map((c:string)=>c.trim()).filter(Boolean);await addCurriculum({class:cl.toUpperCase(),name:nc.name,book:nc.book,publisher:nc.publisher,chapters:ch});setShowAdd(false);setNc({name:'',book:'',publisher:'',chapters:''});setCur(await getCurriculum(cl.toUpperCase()))};
  return(<div><h2 className="text-lg font-bold mb-4">Curriculum</h2>
    {isMgmt&&<div className="mb-3"><select value={cl} onChange={e=>setCl(e.target.value)} className="p-2.5 border rounded-lg text-sm">{CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>}
    <button onClick={()=>setShowAdd(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Add Subject</button>
    <div className="space-y-2">{cur.map(s=>(<div key={s.id} className="bg-white border rounded-xl p-4 flex justify-between items-center"><div><strong className="text-sm">{s.name}</strong><div className="text-[10px] text-gray-400">{s.book}{s.publisher?` — ${s.publisher}`:''} | {(s.chapters||[]).length} chapters</div></div><button onClick={async()=>{await deleteCurriculum(s.id);setCur(cur.filter(x=>x.id!==s.id))}} className="text-red-500 text-[11px] font-semibold">Del</button></div>))}</div>
    {showAdd&&<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"><h3 className="font-bold mb-4">Add Subject</h3>{['name','book','publisher'].map(f=>(<div key={f} className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">{f}</label><input value={(nc as any)[f]} onChange={e=>setNc({...nc,[f]:e.target.value})} className="w-full p-2 border rounded-lg text-sm"/></div>))}<div className="mb-4"><label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Chapters</label><textarea value={nc.chapters} onChange={e=>setNc({...nc,chapters:e.target.value})} rows={4} className="w-full p-2 border rounded-lg text-sm resize-none" placeholder="One per line"/></div><div className="flex gap-2"><button onClick={()=>setShowAdd(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button><button onClick={doAdd} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Add</button></div></div></div>}
  </div>);
}

function SettingsPanel(){
  const [code,setCode]=useState('Haziq1962');const [pass,setPass]=useState('Haziq1962');
  return(<div><h2 className="text-lg font-bold mb-4">Settings</h2><div className="bg-white border rounded-xl p-6 max-w-sm"><h3 className="font-semibold text-sm mb-3">Management Credentials</h3><div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Security Code</label><input value={code} onChange={e=>setCode(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm"/></div><div className="mb-4"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Password</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm"/></div><button onClick={async()=>{await saveManagement(code,pass);alert('Saved!')}} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save</button></div></div>);
}
