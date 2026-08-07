/** SKPPS Management — Premium Design | Trained OCR | Firebase */
(function(){window.FIREBASE_CONFIG={};var s=localStorage.getItem("skpps_firebase_config");if(s)try{FIREBASE_CONFIG=JSON.parse(s)}catch(e){}var _f=null,_p=null,_a=null;window._fbReady=function(){if(_p)return _p;_p=new Promise(function(ok){if(_f&&_f.db&&_a&&_a.currentUser)return ok(_f);if(!FIREBASE_CONFIG.apiKey){ok(null);return}function ld(u){return new Promise(function(y,n){if(document.querySelector('script[src="'+u+'"]'))return y();var s=document.createElement('script');s.src=u;s.onload=y;s.onerror=n;document.head.appendChild(s)})}var loaded=false,to=setTimeout(function(){if(!loaded){loaded=true;console.warn("Auth timeout");ok(null)}},15000);Promise.all([ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js'),ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'),ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js')]).then(function(){if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);_a=firebase.auth();var db=firebase.firestore();function done(){if(loaded)return;loaded=true;clearTimeout(to);_f={db:db,auth:_a};try{db.enablePersistence({synchronizeTabs:true}).catch(function(){})}catch(e){}ok(_f)}var unsub=_a.onAuthStateChanged(function(user){unsub();if(user){done()}else{_a.signInAnonymously().then(done).catch(function(e){done()})}})}).catch(function(e){if(!loaded){loaded=true;clearTimeout(to);ok(null)}})});return _p};window.fbGS=async function(){var f=await _fbReady();if(!f)return[];var s=await f.db.collection('students').where('is_active','==',true).get();return s.docs.map(function(d){var r=d.data();r.student_id=d.id;return r})};window.fbAS=async function(d){var f=await _fbReady();if(!f)throw new Error("Firebase not connected");return f.db.collection('students').doc(d.student_id).set(d)};window.fbGT=async function(){var f=await _fbReady();if(!f)return[];var s=await f.db.collection('teachers').where('is_active','==',true).get();return s.docs.map(function(d){var r=d.data();return r})};window.fbAT=async function(d){var f=await _fbReady();if(!f)throw new Error("Firebase not connected");return f.db.collection('teachers').doc(d.username).set(d)};window.fbFT=async function(u){var f=await _fbReady();if(!f)return null;var d=await f.db.collection('teachers').doc(u).get();return d.exists?d.data():null}})();

(function(){
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('un').textContent=' - '+(sessionStorage.getItem('skpps_name')||'Admin');
var S=[],T=[],cur='scan',cs=null,ocr=null;
async function lO(){if(!ocr)ocr=await Tesseract.createWorker('eng');return ocr}

async function loadDB(){
  document.getElementById('mc').innerHTML='<div style="text-align:center;padding:80px"><div style="width:32px;height:32px;border:3px solid #E8EAED;border-top-color:#4285F4;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 14px"></div><p style="font-size:13px;color:var(--g600)">Connecting to Firestore...</p></div>';
  S=[];T=[];
  try{S=await fbGS();if(!S)S=[]}catch(e){console.error(e);S=[]}
  try{T=await fbGT();if(!T)T=[]}catch(e){console.error(e);T=[]}
  if(!S.length&&!T.length){var fb=await _fbReady();if(!fb)document.getElementById('mc').innerHTML='<div class="card"><div class="ch" style="color:#DC2626">Not Connected</div><div class="cb"><div class="alert alert-err">Run <a href="../firebase-setup.html" style="color:#DC2626;font-weight:700">Firebase Setup</a> first.</div></div></div>';else render();return}
  render();
}
window.logout=function(){sessionStorage.clear();location.href='../staff-login.html'}
window.navTo=function(t){cur=t;closeCam();render()}

function render(){
  var h='<div class="stats-row"><div class="stat-card sb"><div class="stat-icon" style="background:#E3F0FD"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--hb)" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="stat-num">'+S.length+'</div><div class="stat-lbl">Students</div></div><div class="stat-card sg"><div class="stat-icon" style="background:#E6F4EA"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--hg)" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div class="stat-num">'+T.length+'</div><div class="stat-lbl">Teachers</div></div><div class="stat-card sr"><div class="stat-icon" style="background:#FDE8E8"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--hr)" stroke-width="1.8"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/></svg></div><div class="stat-num">'+(S.length?new Set(S.map(function(s){return s.class||s.cls})).size:0)+'</div><div class="stat-lbl">Classes</div></div></div>';
  h+='<div class="mgtabs">'+tb('scan','Scanner')+tb('bulk','Import')+tb('teacher','Teachers')+tb('all','Students')+tb('status','Status')+'</div>';
  if(cur==='scan')h+=rScan();else if(cur==='bulk')h+=rBulk();else if(cur==='teacher')h+=rTeachers();else if(cur==='status')h+=rStatus();else h+=rAll();
  document.getElementById('mc').innerHTML=h;
}
function tb(id,lb){return'<button class="mgtab'+(cur===id?' active':'')+'" onclick="navTo(\''+id+'\')">'+lb+'</button>'}

function rScan(){return'<div class="sg"><div class="sc" onclick="document.getElementById(\'fi\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><h3>Upload Photo</h3><p>Select ID card image</p><input type="file" id="fi" accept="image/*" onchange="doUpload(event)"></div><div class="sc" onclick="openCam()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><h3>Take Photo</h3><p>Use camera</p></div></div><div id="pa"></div><div id="raw" style="display:none;background:#F8F9FA;border-radius:12px;padding:12px;margin:12px 0;font-family:monospace;font-size:11px;white-space:pre-wrap;max-height:120px;overflow:auto;color:#5F6368"></div><div id="ra"></div>'}
window.doUpload=function(e){var f=e.target.files[0];if(!f)return;showP();scanFile(f);e.target.value=''}
function showP(){document.getElementById('pa').innerHTML='<div class="card" style="text-align:center;padding:22px;margin-bottom:10px"><p style="font-size:13px;color:var(--g600);margin-bottom:10px">Scanning ID Card...</p><div class="prog"><div class="pf" id="ob" style="width:0%"></div></div><p style="font-size:10px;color:var(--g500);margin-top:6px" id="ot">Loading...</p></div>';document.getElementById('ra').innerHTML='';document.getElementById('raw').style.display='none'}
async function scanFile(file){try{var img=await new Promise(function(ok,fail){var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){ok(i)};i.onerror=fail;i.src=r.result};r.onerror=fail;r.readAsDataURL(file)});pt(10,'OCR ready');var w=await lO();pt(25,'Reading...');var res=await w.recognize(img);pt(100,'Complete');document.getElementById('raw').textContent='RAW:\n'+res.data.text;document.getElementById('raw').style.display='block';showForm(parseCard(res.data.text),res.data.text)}catch(e){showErr(e.message||'Scan failed');setTimeout(function(){document.getElementById('pa').innerHTML=''},500)}}
function pt(v,m){var b=document.getElementById('ob'),t=document.getElementById('ot');if(b)b.style.width=v+'%';if(t)t.textContent=m||''}

window.openCam=function(){document.getElementById('cm').classList.add('open');var v=document.getElementById('cv');navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}}).then(function(s){cs=s;v.srcObject=s}).catch(function(){alert('Camera unavailable');closeCam()})}
window.closeCam=function(){document.getElementById('cm').classList.remove('open');if(cs){cs.getTracks().forEach(function(t){t.stop()});cs=null}}
window.capturePhoto=function(){var v=document.getElementById('cv');if(!v||v.readyState<2)return;var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);closeCam();c.toBlob(function(b){showP();scanFile(b)},'image/jpeg',0.85)}

/* TRAINED OCR — SK Presidency ID Card */
function parseCard(raw){
  var txt=raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n').replace(/[^a-zA-Z0-9\s\n\/\-.:@()#&|_-]/g,' ').replace(/ +/g,' ').trim();
  var lines=txt.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  var f={name:'',className:'',section:'',studentID:'',father:'',phone:'',dob:''};
  function sk(l){var lo=l.toLowerCase();return lo.includes('presidency')||lo.includes('public school')||lo.includes('sultanpur')||lo.includes('uttar pradesh')||lo.includes('cbse')||lo.includes('id card')||lo.includes('session')||lo.includes('address')||lo==='skpps'||lo==='sk'||l.length<2}
  // NAME: ALL CAPS 2-4 words
  for(var i=0;i<lines.length;i++){if(sk(lines[i]))continue;var cl=lines[i].replace(/[|_~`]/g,' ').replace(/ +/g,' ').trim();if(cl.match(/^[A-Z]{2,}(\s+[A-Z]{2,}){1,3}$/)){f.name=cl;break}}
  // CLASS & SECTION: 10th-_-C
  for(var i=0;i<lines.length;i++){if(sk(lines[i]))continue;var cm=lines[i].match(/(\d{1,2}(?:st|nd|rd|th)?)[\s_-]*[-_][\s_-]*([A-C])/i);if(cm){f.className=cm[1].toUpperCase();f.section=cm[2].toUpperCase();break}}
  // SR NO
  for(var i=0;i<lines.length;i++){if(lines[i].match(/^SR\s*No/i)||lines[i].match(/^SRNo/i)){var sm=lines[i].match(/(\d{2,4}\/\d{4})/);if(sm)f.studentID='SKPPS'+sm[1].replace('/','');break}}
  // FATHER
  for(var i=0;i<lines.length;i++){if(lines[i].match(/^F\.?\s*Name/i)||lines[i].match(/^Father/i)){var v=lines[i].replace(/^F\.?\s*Name\s*[:=\s]+/i,'').replace(/^Father\s*(Name)?\s*[:=\s]+/i,'').replace(/[|\\]/g,'').trim();if(v.length>2)f.father=v;break}}
  // DOB
  for(var i=0;i<lines.length;i++){if(lines[i].match(/^DOB/i)){var dm=lines[i].match(/(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/);if(dm){var p=dm[1].split(/[-\/.]/);if(p[2].length===2)p[2]='20'+p[2];f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')};break}}
  // MOBILE
  for(var i=0;i<lines.length;i++){if(lines[i].match(/^Mob/i)||lines[i].match(/^Mobile/i)||lines[i].match(/^Phone/i)){var pm=lines[i].match(/(\d{10})/);if(pm)f.phone=pm[1];break}}
  // Fallbacks
  if(!f.name){for(var i=0;i<lines.length;i++){if(sk(lines[i]))continue;var cl=lines[i].replace(/[|_~`]/g,' ').replace(/ +/g,' ').trim();if(cl.match(/^[A-Z]{2,}(\s+[A-Z]{2,}){1,3}$/)){f.name=cl;break}}}
  if(!f.phone){var pm2=txt.replace(/\s/g,'').match(/(\d{10})/);if(pm2)f.phone=pm2[1]}
  if(!f.dob){var dm2=txt.match(/(\d{2}[-\/.]\d{2}[-\/.]\d{4})/);if(dm2){var p=dm2[1].split(/[-\/.]/);f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')}}
  f.name=tC(f.name);f.father=tC(f.father);return f;
}
function tC(s){if(!s)return'';if(s===s.toUpperCase())return s.replace(/\b[a-z]/gi,function(c,i){return i===0||s[i-1]===' '?c.toUpperCase():c.toLowerCase()});return s.replace(/\b\w/g,function(c){return c.toUpperCase()})}

function showForm(d,raw){
  var sid=d.studentID||('SKPPS'+new Date().getFullYear()+String(Date.now()%10000).padStart(4,'0'));
  var ch=!!(d.name||d.className||d.dob||d.father||d.phone);
  var h='<div class="card" style="border:2px solid #4ade80;margin-bottom:10px"><div class="ch" style="color:#059669">ID Card Scanned '+(ch?'- Auto-filled':'')+'</div><div class="cb"><details style="margin-bottom:12px"><summary style="font-size:10px;color:var(--g500);cursor:pointer">OCR Text</summary><pre style="font-size:9px;background:#F8F9FA;padding:8px;border-radius:6px;max-height:60px;overflow:auto;font-family:monospace">'+xe(raw)+'</pre></details><form onsubmit="return saveStu(event)"><input type="hidden" name="sid" value="'+xe(sid)+'"><div class="fr"><div class="fg"><label>Student ID</label><input name="stid" value="'+xe(sid)+'" style="background:#f0fdf4;color:#065f46" readonly></div><div class="fg"><label>Full Name *</label><input name="name" value="'+xe(d.name)+'" '+(d.name?'style="background:#f0fdf4"':'')+' required></div></div><div class="fr"><div class="fg"><label>Class *</label><input name="cls" value="'+xe(d.className)+'" '+(d.className?'style="background:#f0fdf4"':'')+' required></div><div class="fg"><label>Section</label><select name="sec"><option '+(d.section==='A'?'selected':'')+'>A</option><option '+(d.section==='B'?'selected':'')+'>B</option><option '+(d.section==='C'?'selected':'')+'>C</option></select></div></div><div class="fr"><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+xe(d.dob)+'" '+(d.dob?'style="background:#f0fdf4"':'')+'></div><div class="fg"><label>Father Name</label><input name="father" value="'+xe(d.father)+'" '+(d.father?'style="background:#f0fdf4"':'')+'></div></div><div class="fr"><div class="fg"><label>Parent Phone</label><input name="phone" value="'+xe(d.phone)+'" type="tel" '+(d.phone?'style="background:#f0fdf4"':'')+'></div><div class="fg"><label>Gender</label><select name="gender"><option>Male</option><option>Female</option></select></div></div><div class="fr"><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div><div class="fg"><label>Blood Group</label><input name="blood" placeholder="Optional"></div></div><div style="display:flex;gap:10px;margin-top:12px"><button type="submit" class="btn btn-green">Save to Firestore</button><button type="button" class="btn btn-outline" onclick="clr()">Cancel</button></div></form></div></div>';
  document.getElementById('ra').innerHTML=h;
}
function xe(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function showErr(m){document.getElementById('ra').innerHTML='<div class="card"><div class="ch" style="color:#DC2626">Scan Failed</div><div class="cb"><p style="color:#DC2626;font-size:12px">'+m+'</p><button onclick="clr()" class="btn btn-outline btn-sm mt-1">Try Again</button></div></div>'}
window.clr=function(){document.getElementById('ra').innerHTML='';document.getElementById('pa').innerHTML='';document.getElementById('raw').style.display='none'}

window.saveStu=async function(e){
  e.preventDefault();var ff=e.target;
  var sid=ff.stid.value,name=ff.name.value,cls=ff.cls.value,sec=ff.sec.value,dob=ff.dob.value||'2000-01-01',father=ff.father.value,phone=ff.phone.value,gender=ff.gender.value,house=ff.house.value,blood=ff.blood.value.trim();
  if(!name||!cls){alert('Name & Class required');return false}
  document.getElementById('ra').innerHTML='<div class="card" style="text-align:center;padding:22px"><div style="width:28px;height:28px;border:3px solid var(--g200);border-top-color:var(--g-blue);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px"></div><p style="font-size:13px;color:var(--g600)">Saving...</p></div>';
  try{
    await fbAS({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,parent_phone:phone,gender:gender,house:house,blood_group:blood||'',is_active:true,password:dob.replace(/-/g,'').substring(0,8)});
    document.getElementById('ra').innerHTML='<div class="card" style="border:2px solid #059669"><div class="ch" style="color:#059669">Saved!</div><div class="cb"><p style="font-size:13px"><strong>'+xe(name)+'</strong> - '+xe(cls)+'-'+xe(sec)+'</p><p style="font-size:10px;color:var(--g600);margin-top:4px">ID: '+xe(sid)+'</p><button onclick="clr()" class="btn btn-green btn-sm mt2">Scan Another</button></div></div>';
    setTimeout(async function(){try{var ns=await fbGS();if(ns&&ns.length>0)S=ns;render()}catch(e){}},400);
  }catch(e){alert('Save failed: '+e.message);document.getElementById('ra').innerHTML='<div style="background:#FEF2F2;color:#DC2626;padding:10px;border-radius:8px;font-size:12px">'+e.message+'</div>'}
  return false;
};

function rBulk(){return'<div class="card"><div class="ch">Bulk Import (CSV)</div><div class="cb"><p style="font-size:11px;color:var(--g600);margin-bottom:10px">ID,Name,Class,Section,DOB,Father,Phone,Gender,House</p><textarea id="csvIn" style="width:100%;height:140px;border:1.5px solid var(--g300);border-radius:8px;padding:10px;font-family:monospace;font-size:11px"></textarea><button class="btn btn-primary btn-sm mt2" onclick="doImport()">Import</button><div id="csvMsg" style="margin-top:8px;font-size:11px"></div></div></div>'}
window.doImport=async function(){var t=document.getElementById('csvIn').value.trim();if(!t)return;var lines=t.split('\n').filter(Boolean),a=0,s=0;for(var i=0;i<lines.length;i++){var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<4){s++;continue}var sid=c[0]||('SKPPS'+new Date().getFullYear()+String(a+1).padStart(3,'0')),name=c[1],cls=c[2],sec=c[3]||'A',dob=c[4]||'2000-01-01',father=c[5]||'',phone=c[6]||'',gender=c[7]||'Male',house=c[8]||'Earth';if(!name||!cls){s++;continue}try{await fbAS({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,parent_phone:phone,gender:gender,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});a++}catch(e){s++}}document.getElementById('csvMsg').innerHTML='<span style="color:#059669">Imported: '+a+' | Skipped: '+s+'</span>';loadDB()}

function rTeachers(){var rows='';if(!T.length)rows='<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--g500)">No teachers yet</td></tr>';else for(var i=0;i<T.length;i++){var t=T[i];rows+='<tr><td><strong>'+xe(t.full_name)+'</strong></td><td>'+xe(t.username)+'</td><td>'+xe(t.email||'-')+'</td><td><span class="badge badge-g">Active</span></td></tr>'}return'<div class="card"><div class="ch">Teachers</div><div class="cb"><form onsubmit="return addT(event)"><div class="fr"><div class="fg"><label>Name</label><input id="tn2" required></div><div class="fg"><label>Username</label><input id="tu2" required></div></div><div class="fr"><div class="fg"><label>Password</label><input type="password" id="tp2" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te2"></div></div><button class="btn btn-primary btn-sm">Add Teacher</button></form><div class="tbl" style="margin-top:14px"><table><tr><th>Name</th><th>User</th><th>Email</th><th>Status</th></tr>'+rows+'</table></div></div></div>'}
window.addT=async function(e){e.preventDefault();var n=document.getElementById('tn2').value.trim(),u=document.getElementById('tu2').value.trim(),p=document.getElementById('tp2').value.trim(),em=document.getElementById('te2').value.trim();try{await fbAT({username:u,password:p,full_name:n,email:em,is_active:true})}catch(er){alert('Failed: '+er.message);return false}loadDB();return false}

function rAll(){
  var rows='';
  if(!S.length)rows='<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--g500)">No students. Use Scanner or Import.</td></tr>';
  else for(var i=0;i<S.length;i++){var s=S[i],hc=s.house||'Earth',bc=(hc==='Earth'?'bd-g':hc==='Fire'?'bd-r':hc==='Water'?'bd-b':'bd-y');rows+='<tr><td style="font-size:10px;font-family:monospace">'+xe(s.student_id)+'</td><td><strong>'+xe(s.full_name)+'</strong></td><td>'+xe(s.class)+'</td><td>'+xe(s.section||'-')+'</td><td style="font-size:10px">'+xe(s.date_of_birth||'-')+'</td><td><span class="bd '+bc+'">'+hc+'</span></td><td>'+xe(s.parent_phone||'-')+'</td></tr>'}
  return'<div class="card"><div class="ch">All Students ('+S.length+')</div><div class="cb"><input style="width:100%;padding:9px 14px;border:1.5px solid var(--g300);border-radius:20px;font-size:12px;font-family:var(--f);margin-bottom:12px" placeholder="Search..." oninput="filter(this.value)"><div class="tbl"><table id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>DOB</th><th>House</th><th>Phone</th></tr>'+rows+'</table></div></div></div>'
}
window.filter=function(q){var r=document.querySelectorAll('#stbl tr');for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'}

window.checkDB=async function(){var st=document.getElementById('dbStat'),dt=document.getElementById('dbDet');st.innerHTML='Checking...';dt.textContent='';try{var f=await _fbReady();if(!f){st.innerHTML='Not Connected';return}var test=await f.db.collection('students').limit(1).get();st.innerHTML='Connected ('+FIREBASE_CONFIG.projectId+')';dt.textContent='Students: '+S.length+' | Teachers: '+T.length}catch(e){st.innerHTML='Failed';dt.textContent=e.message}}

function rStatus(){
  setTimeout(function(){checkDB()},300);
  return'<div class="card"><div class="ch">System Status</div><div class="cb"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px"><div style="background:var(--g50);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--g500);margin-bottom:4px">Firebase</div><div style="font-size:14px;font-weight:500" id="dbStat">...</div><div style="font-size:10px;color:var(--g500);margin-top:2px" id="dbDet"></div></div><div style="background:var(--g50);border-radius:8px;padding:14px"><div style="font-size:11px;color:var(--g500);margin-bottom:4px">Rules</div><div style="font-size:14px;font-weight:500;color:#059669">READ: Open</div><div style="font-size:10px;color:var(--g500);margin-top:2px">WRITE: Auth</div></div></div><button class="btn btn-primary btn-sm" onclick="checkDB()">Re-Test</button></div></div>'
}

loadDB();setTimeout(function(){lO().catch(function(){})},1000);
})();
