/** SKPPS Management — Google Labs Design | Firebase | Auto-fill OCR */
(function(){
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('un').textContent=' — '+(sessionStorage.getItem('skpps_name')||'Admin');

var S=[],T=[],cur='scan',cs=null,ocr=null;

async function lO(){if(!ocr)ocr=await Tesseract.createWorker('eng');return ocr}

/* ===== DATA LOAD — CRITICAL: Must wait for Firebase ===== */
async function loadDB(){
  document.getElementById('mc').innerHTML='<div class="ld"><div class="sp"></div><p>Connecting to Firestore...</p></div>';
  S=[];T=[];
  try{S=await fbGetStudents();if(!S)S=[]}catch(e){S=[]}
  try{T=await fbGetTeachers();if(!T)T=[]}catch(e){T=[]}
  render();
}

window.logout=function(){sessionStorage.clear();location.href='../staff-login.html'};
window.navTo=function(t){cur=t;closeCam();render()};

/* ===== RENDER ===== */
function render(){
  var h='';
  h+='<div class="stats"><div class="st"><div class="v">'+S.length+'</div><div class="l">Students</div></div><div class="st"><div class="v">'+T.length+'</div><div class="l">Teachers</div></div><div class="st"><div class="v">'+(S.length?new Set(S.map(function(s){return s.class||s.cls})).size:0)+'</div><div class="l">Classes</div></div></div>';
  h+='<div class="tabs">'+tb('scan','Scanner')+tb('bulk','Import')+tb('teacher','Teachers')+tb('all','Students')+'</div>';
  if(cur==='scan')h+=rScan();else if(cur==='bulk')h+=rBulk();else if(cur==='teacher')h+=rTeachers();else h+=rAll();
  document.getElementById('mc').innerHTML=h;
}
function tb(id,lb){return'<button class="tab'+(cur===id?' active':'')+'" onclick="navTo(\''+id+'\')">'+lb+'</button>'}

/* ===== SCANNER ===== */
function rScan(){
  return'<div class="sg"><div class="sc" onclick="document.getElementById(\'fi\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><h3>Upload Photo</h3><p>Select ID card image</p><input type="file" id="fi" accept="image/*" onchange="doUpload(event)"></div><div class="sc" onclick="openCam()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><h3>Take Photo</h3><p>Use camera</p></div></div><div id="pa"></div><div id="raw" style="display:none;background:#F8F9FA;border-radius:12px;padding:12px;margin:12px 0;font-family:monospace;font-size:11px;white-space:pre-wrap;max-height:120px;overflow:auto;color:#5F6368"></div><div id="ra"></div>';
}

window.doUpload=function(e){var f=e.target.files[0];if(!f)return;showP();scanFile(f);e.target.value=''};
function showP(){document.getElementById('pa').innerHTML='<div class="card" style="text-align:center;padding:24px;margin-bottom:12px"><p style="font-size:14px;color:var(--g600);margin-bottom:12px">Scanning ID Card...</p><div class="prog"><div class="pf" id="ob" style="width:0%"></div></div><p style="font-size:11px;color:var(--g500);margin-top:8px" id="ot">Loading OCR...</p></div>';document.getElementById('ra').innerHTML='';document.getElementById('raw').style.display='none'}

async function scanFile(file){
  try{var img=await new Promise(function(ok,fail){var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){ok(i)};i.onerror=fail;i.src=r.result};r.onerror=fail;r.readAsDataURL(file)});pt(10,'OCR ready');var w=await lO();pt(25,'Reading text...');var result=await w.recognize(img);pt(100,'Complete!');document.getElementById('raw').textContent='RAW OCR:\n'+result.data.text;document.getElementById('raw').style.display='block';showForm(parseCard(result.data.text),result.data.text)}catch(e){showErr('Scan failed: '+e.message)}setTimeout(function(){document.getElementById('pa').innerHTML=''},500)}
function pt(v,m){var b=document.getElementById('ob'),t=document.getElementById('ot');if(b)b.style.width=v+'%';if(t)t.textContent=m||''}

/* ===== CAMERA ===== */
window.openCam=function(){document.getElementById('cm').classList.add('open');var v=document.getElementById('cv');navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}}).then(function(s){cs=s;v.srcObject=s}).catch(function(){alert('Camera unavailable');closeCam()})};
window.closeCam=function(){document.getElementById('cm').classList.remove('open');if(cs){cs.getTracks().forEach(function(t){t.stop()});cs=null}};
window.capturePhoto=function(){var v=document.getElementById('cv');if(!v||v.readyState<2)return;var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);closeCam();c.toBlob(function(b){showP();scanFile(b)},'image/jpeg',0.85)};

/* ===== OCR PARSER — Clean, per-line prefix matching ===== */
function parseCard(raw){
  var txt=raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n');txt=txt.replace(/[^a-zA-Z0-9\s\n\/\-.,:@()#'"]/g,' ').replace(/ +/g,' ').trim();
  var lines=txt.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  var f={name:'',className:'',section:'',studentID:'',father:'',phone:'',dob:''};

  function skip(l){var lo=l.toLowerCase();return lo.includes('presidency')||lo.includes('public school')||lo.includes('sultanpur')||lo.includes('uttar pradesh')||lo.includes('cbse')||lo.includes('id card')||lo.includes('student id card')||lo==='skpps'||lo==='sk'||l.length<3}

  function cap(lbl,line){var m=line.match(new RegExp(lbl+'[\\s\\w]*?[:=\\s]+([a-z0-9]{2,}(?:\\s+[a-z0-9]{2,}){1,3})','i'));return m?m[1].trim():''}
  function capNum(lbl,line){var m=line.match(new RegExp(lbl+'[\\s\\w]*?[:=\\s]+(\\d{5}[\\s\\-]?\\d{5}|\\d{10})','i'));return m?m[1].replace(/\D/g,''):''}

  for(var i=0;i<lines.length;i++){var l=lines[i],ll=l.toLowerCase();if(skip(l))continue;

    if(ll.match(/^name\s*[:=]/i)||ll.match(/^student\s*name\s*[:=]/i)){
      var v=cap('name',ll);if(v&&!/father|mother|class|blood|phone|dob|school|presidency|skpps/i.test(v))f.name=v}
    else if(ll.match(/^father/i)){var v=cap('father',ll);if(v&&!/mother/i.test(v))f.father=v}
    else if(ll.match(/^class\b/i)){var cl=l.replace(/class\s*[:=\s]*/i,'').trim();var cm=cl.match(/\b(nursery|lkg|ukg|[ivx]+)\b/i);if(cm)f.className=cm[1].toUpperCase();var sm=ll.match(/\b([a-c])\b/i);if(sm)f.section=sm[1].toUpperCase()}
    else if(ll.match(/^section\b/i)){var sm2=ll.match(/\b([a-c])\b/i);if(sm2)f.section=sm2[1].toUpperCase()}
    else if(ll.match(/^dob\b|^date\s+of\s+birth|^birth/i)){var dm=ll.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/);if(dm){var p=dm[1].split(/[\/\-.]/);if(p[2].length===2)p[2]='20'+p[2];f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')}}
    else if(ll.match(/^phone\b|^mobile\b|^contact\b/i)){var pm=ll.match(/(\d{5}[\s\-]?\d{5}|\d{10})/);if(pm)f.phone=pm[1].replace(/\D/g,'')}
    else if(ll.match(/^student\s*id|^admission|^adm\s*no|^id\s*no/i)){var im=ll.match(/([\w\-]{3,})/);if(im)f.studentID=im[1].toUpperCase()}
  }

  if(!f.className){for(var i=0;i<lines.length;i++){if(skip(lines[i]))continue;var cm2=lines[i].match(/\b(nursery|lkg|ukg|[ivx]+)\b/i);if(cm2&&!/class|section|school|presidency/i.test(lines[i].toLowerCase())){f.className=cm2[1].toUpperCase();break}}}
  if(!f.dob){var dm2=txt.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/);if(dm2){var p=dm2[1].split(/[\/\-.]/);f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')}}
  if(!f.phone){var pm2=txt.match(/(\d{10})/);if(pm2&&!/[\d]{12,}/.test(pm2[1]))f.phone=pm2[1]}

  f.name=tCase(f.name);f.father=tCase(f.father);return f;
}
function tCase(s){if(!s)return'';return s.replace(/\b[a-z]/g,function(c){return c.toUpperCase()})}

/* ===== SHOW FORM ===== */
function showForm(d,raw){
  var sid=d.studentID||('SKPPS'+new Date().getFullYear()+String(Date.now()%10000).padStart(4,'0'));
  var ch={name:!!d.name,cls:!!d.className,dob:!!d.dob,father:!!d.father,phone:!!d.phone};var any=ch.name||ch.cls||ch.dob||ch.father||ch.phone;
  function gi(ok){return ok?'style="background:#f0fdf4;border-color:#86efac"':''}function ci(ok){return ok?'✓':'✗'}function cc(ok){return ok?'#059669':'#DC2626'}
  var h='<div class="card" style="border:2px solid #4ade80;margin-bottom:12px"><div class="ch" style="color:#059669"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>ID Card Scanned '+(any?'— Auto-filled':'— Verify')+'</div><div class="cb"><details style="margin-bottom:12px"><summary style="font-size:11px;color:var(--g500);cursor:pointer">View OCR text</summary><pre style="font-size:10px;background:#F8F9FA;padding:10px;border-radius:8px;max-height:70px;overflow:auto;margin-top:6px;font-family:monospace;white-space:pre-wrap">'+es(raw)+'</pre></details><div style="font-size:11px;color:var(--g500);margin-bottom:12px;background:#F0FDF4;padding:8px 12px;border-radius:8px;display:flex;flex-wrap:wrap;gap:6px 16px">';
  for(var k in ch)h+='<span style="color:'+cc(ch[k])+'">'+ci(ch[k])+' '+k.charAt(0).toUpperCase()+k.slice(1)+'</span>';
  h+='</div><form onsubmit="return saveStu(event)"><input type="hidden" name="sid" value="'+es(sid)+'"><div class="fr"><div class="fg"><label>Student ID</label><input name="stid" value="'+es(sid)+'" style="background:#f0fdf4;color:#065f46;border-color:#86efac" readonly></div><div class="fg"><label>Full Name *</label><input name="name" value="'+es(d.name)+'" '+gi(ch.name)+' required></div></div><div class="fr"><div class="fg"><label>Class *</label><input name="cls" value="'+es(d.className)+'" '+gi(ch.cls)+' required></div><div class="fg"><label>Section</label><select name="sec"><option '+(d.section==='A'?'selected':'')+'>A</option><option '+(d.section==='B'?'selected':'')+'>B</option><option '+(d.section==='C'?'selected':'')+'>C</option></select></div></div><div class="fr"><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+es(d.dob)+'" '+gi(ch.dob)+'></div><div class="fg"><label>Father Name</label><input name="father" value="'+es(d.father)+'" '+gi(ch.father)+'></div></div><div class="fr"><div class="fg"><label>Parent Phone</label><input name="phone" value="'+es(d.phone)+'" type="tel" '+gi(ch.phone)+'></div><div class="fg"><label>Gender</label><select name="gender"><option>Male</option><option>Female</option></select></div></div><div style="display:flex;gap:10px;margin-top:14px"><button type="submit" class="bt bt-g">Save to Firestore</button><button type="button" class="bt bt-s" onclick="clr()">Cancel</button></div></form></div></div>';
  document.getElementById('ra').innerHTML=h;
}
function es(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function showErr(msg){document.getElementById('ra').innerHTML='<div class="card"><div class="ch" style="color:#DC2626">Scan Failed</div><div class="cb"><div class="al al-err">'+msg+'</div><button onclick="clr()" class="bt bt-s">Try Again</button></div></div>'}
window.clr=function(){document.getElementById('ra').innerHTML='';document.getElementById('pa').innerHTML='';document.getElementById('raw').style.display='none'}

/* ===== SAVE — FIXED: Save first, then async refresh ===== */
window.saveStu=async function(e){
  e.preventDefault();var ff=e.target;
  var sid=ff.stid.value,name=ff.name.value,cls=ff.cls.value,sec=ff.sec.value,dob=ff.dob.value||'2000-01-01',father=ff.father.value,phone=ff.phone.value,gender=ff.gender.value;
  if(!name||!cls){alert('Name and Class required');return false}
  document.getElementById('ra').innerHTML='<div class="card" style="text-align:center;padding:24px"><div style="width:32px;height:32px;border:3px solid var(--g200);border-top-color:var(--g-blue);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px"></div><p style="font-size:14px;color:var(--g600)">Saving to Firestore...</p></div>';
  try{
    await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,parent_phone:phone,gender:gender,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});
    document.getElementById('ra').innerHTML='<div class="card" style="border:2px solid #059669"><div class="ch" style="color:#059669">Saved!</div><div class="cb"><p style="font-size:14px"><strong>'+es(name)+'</strong> saved to Firestore</p><p style="font-size:11px;color:var(--g600);margin-top:6px">ID: '+es(sid)+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p><button onclick="clr()" class="bt bt-s" style="margin-top:12px">Scan Another</button></div></div>';
    /* Refresh in background */
    setTimeout(async function(){try{var ns=await fbGetStudents();if(ns&&ns.length>0)S=ns;render()}catch(e){}},500);
  }catch(e){alert('Save failed: '+e.message);document.getElementById('ra').innerHTML='<div class="al al-err">'+e.message+'</div>'}
  return false;
};

/* ===== BULK IMPORT ===== */
function rBulk(){return'<div class="card"><div class="ch">Bulk Import (CSV)</div><div class="cb"><p style="font-size:12px;color:var(--g600);margin-bottom:12px">Format: ID,Name,Class,Section,DOB,Father,Mother,Phone,Gender</p><textarea id="csvIn" style="width:100%;height:160px;border:1.5px solid var(--g300);border-radius:8px;padding:12px;font-family:monospace;font-size:11px" placeholder="SKPPS2024001,John Smith,V,A,2017-05-10,Robert,Mary,9876543210,Male"></textarea><button class="bt bt-p" style="margin-top:10px" onclick="doImport()">Import to Firestore</button><div id="csvMsg" style="margin-top:10px"></div></div></div>'}
window.doImport=async function(){var t=document.getElementById('csvIn').value.trim();if(!t)return;var lines=t.split('\n').filter(Boolean),a=0,s=0;for(var i=0;i<lines.length;i++){var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<5){s++;continue}var sid=c[0]||('SKPPS'+new Date().getFullYear()+String(a+1).padStart(3,'0')),name=c[1],cls=c[2],sec=c[3]||'A',dob=c[4]||'2000-01-01',father=c[5]||'',mother=c[6]||'',phone=c[7]||'',gender=c[8]||'Male';if(!name||!cls){s++;continue}try{await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,mother_name:mother,parent_phone:phone,gender:gender,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});a++}catch(e){s++}}document.getElementById('csvMsg').innerHTML='<div class="al al-ok">Imported: '+a+'. Skipped: '+s+'</div>';loadDB()}

/* ===== TEACHERS ===== */
function rTeachers(){var rows='';if(!T.length)rows='<tr><td colspan="3"><div class="emp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><p>No teachers yet</p></div></td></tr>';else for(var i=0;i<T.length;i++){var t=T[i];rows+='<tr><td><strong>'+es(t.full_name)+'</strong></td><td>'+es(t.username)+'</td><td><span class="bd bd-g">Active</span></td></tr>'}return'<div class="card"><div class="ch">Teachers</div><div class="cb"><form onsubmit="return addT(event)"><div class="fr"><div class="fg"><label>Full Name</label><input id="tn2" required></div><div class="fg"><label>Username</label><input id="tu2" required></div></div><div class="fr"><div class="fg"><label>Password</label><input type="password" id="tp2" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te2"></div></div><button type="submit" class="bt bt-p">Add Teacher</button></form><div class="tbl" style="margin-top:16px"><table><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>'}
window.addT=async function(e){e.preventDefault();var n=document.getElementById('tn2').value.trim(),u=document.getElementById('tu2').value.trim(),p=document.getElementById('tp2').value.trim(),em=document.getElementById('te2').value.trim();try{await fbAddTeacher({username:u,password:p,full_name:n,email:em,is_active:true})}catch(er){alert('Failed: '+er.message);return false}loadDB();return false}

/* ===== STUDENTS TABLE — FIXED: Shows all data from Firebase ===== */
function rAll(){
  var rows='';
  if(!S.length)rows='<tr><td colspan="8"><div class="emp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg><p>No students yet</p><span>Use Scanner or Import to add students</span></div></td></tr>';
  else for(var i=0;i<S.length;i++){
    var s=S[i],hc=s.house||'Earth',bc=(hc==='Earth'?'bd-g':hc==='Fire'?'bd-r':hc==='Water'?'bd-b':'bd-y');
    rows+='<tr><td style="font-size:11px;font-family:monospace">'+es(s.student_id)+'</td><td><strong>'+es(s.full_name)+'</strong></td><td>'+es(s.class)+'</td><td>'+es(s.section||'-')+'</td><td style="font-size:11px">'+es(s.date_of_birth||'-')+'</td><td><span class="bd '+bc+'">'+hc+'</span></td><td>'+es(s.parent_phone||'-')+'</td><td style="font-size:10px">'+es(s.blood_group||'-')+'</td></tr>'
  }
  return'<div class="card"><div class="ch">All Students ('+S.length+')</div><div class="cb"><input style="width:100%;padding:10px 14px;border:1.5px solid var(--g300);border-radius:24px;font-size:13px;font-family:inherit;margin-bottom:14px" placeholder="Search students..." oninput="filter(this.value)"><div class="tbl"><table id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>DOB</th><th>House</th><th>Phone</th><th>Blood</th></tr>'+rows+'</table></div></div></div>'
}
window.filter=function(q){var r=document.querySelectorAll('#stbl tr');for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'}

loadDB();setTimeout(function(){lO().catch(function(){})},1000);
})();
