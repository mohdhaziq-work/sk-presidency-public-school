/* SKPPS Management Panel v7 - Auto-fill from ID Card */
(function(){"use strict";
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('uname').textContent=' - '+(sessionStorage.getItem('skpps_name')||'Admin');

var students=[],teachers=[],curTab='scan',camStream=null,_ocrWorker=null;

/* === TESSERACT WORKER === */
async function getOCR(){if(_ocrWorker)return _ocrWorker;_ocrWorker=await Tesseract.createWorker('eng');return _ocrWorker}

/* === DATA: FIREBASE ONLY === */
async function loadDB(){
  document.getElementById('mc').innerHTML='<div style="text-align:center;padding:80px"><div style="width:36px;height:36px;border:3px solid #E8EAED;border-top-color:#1A73E8;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div><p style="color:#5F6368;font-size:14px">Loading from Firestore...</p></div>';
  try{students=await fbGetStudents()}catch(e){students=[]}
  try{teachers=await fbGetTeachers()}catch(e){teachers=[]}
  render();
}

/* === NAV === */
window.logout=function(){sessionStorage.clear();location.href='../staff-login.html'};
window.navTo=function(t){curTab=t;closeCam();render()};

/* === RENDER === */
function render(){
  var h='';
  h+='<div class="stats"><div class="stat"><div class="v">'+students.length+'</div><div class="l">Students in Firestore</div></div><div class="stat"><div class="v">'+teachers.length+'</div><div class="l">Teachers</div></div><div class="stat"><div class="v">'+(students.length?new Set(students.map(function(s){return s.class||s.cls})).size:0)+'</div><div class="l">Classes</div></div></div>';
  h+='<div class="tab-bar">'+tb('scan','Scanner')+tb('bulk','Import')+tb('teacher','Teachers')+tb('all','Students')+'</div>';
  if(curTab==='scan')h+=renderScanner();else if(curTab==='bulk')h+=renderBulk();else if(curTab==='teacher')h+=renderTeachers();else h+=renderAll();
  document.getElementById('mc').innerHTML=h;
}
function tb(id,lbl){return'<button class="'+(curTab===id?'active':'')+'" onclick="navTo(\''+id+'\')">'+lbl+'</button>'}

/* === SCANNER === */
function renderScanner(){
  return'<div class="scan-options">'+
    '<div class="scan-opt" onclick="document.getElementById(\'fileInp\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><h3>Upload Photo</h3><p>Select ID card image from your device</p><input type="file" id="fileInp" accept="image/*" onchange="handleUpload(event)"></div>'+
    '<div class="scan-opt" onclick="openCam()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><h3>Take Photo</h3><p>Use camera to capture ID card</p></div>'+
  '</div><div id="procArea"></div><div id="resultArea"></div>';
}

/* === UPLOAD === */
window.handleUpload=function(e){var f=e.target.files[0];if(!f)return;showProgress();scanImage(f);e.target.value=''};

function showProgress(){
  document.getElementById('procArea').innerHTML='<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;padding:16px;text-align:center;margin-bottom:12px"><p style="font-size:12px;color:#5F6368;margin-bottom:8px">Scanning ID Card...</p><div class="progress-wrap"><div class="progress-fill" id="ocrBar" style="width:0%"></div></div><p style="font-size:10px;color:#9AA0A6;margin-top:6px" id="ocrText">Loading OCR...</p></div>';
  document.getElementById('resultArea').innerHTML='';
}

/* === PROCESS IMAGE === */
async function scanImage(file){
  try{
    var img=await new Promise(function(ok,fail){
      var r=new FileReader();
      r.onload=function(){var i=new Image();i.onload=function(){ok(i)};i.onerror=fail;i.src=r.result};
      r.onerror=fail;r.readAsDataURL(file);
    });
    updatePct(5,'Loading OCR engine...');
    var worker=await getOCR();
    updatePct(15,'Reading text from card...');
    var result=await worker.recognize(img);
    updatePct(100,'Complete!');
    var data=parseID(result.data.text);
    showAutoFillForm(data,result.data.text);
  }catch(e){showErr('Scan failed. Please try again with a clearer photo.');}
  setTimeout(function(){document.getElementById('procArea').innerHTML=''},600);
}

function updatePct(pct,msg){
  var b=document.getElementById('ocrBar'),t=document.getElementById('ocrText');
  if(b)b.style.width=pct+'%';if(t)t.textContent=msg||'';
}

/* === CAMERA === */
window.openCam=function(){
  document.getElementById('camModal').classList.add('open');
  var v=document.getElementById('camVid');
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}})
    .then(function(s){camStream=s;v.srcObject=s}).catch(function(){alert('Camera unavailable');closeCam()});
};
window.closeCam=function(){
  document.getElementById('camModal').classList.remove('open');
  if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null}
};
window.capturePhoto=function(){
  var v=document.getElementById('camVid');if(!v||v.readyState<2)return;
  var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0);closeCam();
  c.toBlob(function(blob){showProgress();scanImage(blob)},'image/jpeg',0.85);
};

/* === SMART OCR PARSER === */
function parseID(text){
  var clean=text.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@\(\)]/g,' ').replace(/\s+/g,' ').trim();
  var words=clean.split(/\s+/).filter(function(w){return w.length>1});
  var lines=clean.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  var f={name:'',className:'',section:'',studentID:'',father:'',phone:'',dob:'',blood:'',gender:'Male'};

  /* === NAME: Find 2+ consecutive capitalized words === */
  for(var i=0;i+1<words.length;i++){
    if(!f.name&&/^[A-Z][a-z]{2,}$/.test(words[i])&&/^[A-Z][a-z]{2,}$/.test(words[i+1])){
      if(!/^(Class|Roll|Father|Mother|Blood|Phone|House|Student|Admission|Date|DOB|Name|Gender|Male|Female|Address|Section|School|Public)$/i.test(words[i]))
        f.name=words[i]+' '+words[i+1];
    }
  }

  /* === LINE-BY-LINE PARSING === */
  for(var i=0;i<lines.length;i++){
    var l=lines[i],lo=l.toLowerCase();

    /* Student ID */
    if(!f.studentID&&l.match(/^SKPPS/i))f.studentID=l;
    else if(!f.studentID&&(lo.includes('student id')||lo.includes('admission no')||lo.includes('adm no')))
      f.studentID=l.replace(/student\s*id|admission\s*(no)?|adm\s*(no)?[:.\s-]*/i,'').trim();
    else if(!f.studentID&&(lo.startsWith('id')||lo.startsWith('no')))
      f.studentID=l.replace(/^(id|no)[:.\s-]*/i,'').trim();

    /* Class */
    if(!f.className&&l.match(/^(Nursery|LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i))
      f.className=l.toUpperCase();
    else if(!f.className&&lo.includes('class'))
      f.className=l.replace(/class[:.\s-]*/i,'').trim().toUpperCase();

    /* Father */
    if(!f.father&&(lo.includes('father')||lo.includes("father's")))
      f.father=l.replace(/father('?s)?\s*(name)?[:.\s-]*/i,'').trim();

    /* Mother */
    if(!f.mother&&(lo.includes('mother')||lo.includes("mother's")))
      f.mother=l.replace(/mother('?s)?\s*(name)?[:.\s-]*/i,'').trim();

    /* Phone */
    if(!f.phone&&l.replace(/\D/g,'').match(/^\d{10}$/))f.phone=l.replace(/\D/g,'');
    else if(!f.phone&&lo.includes('phone'))f.phone=l.replace(/phone\s*(no|number)?[:.\s-]*/i,'').replace(/\D/g,'');

    /* DOB */
    if(!f.dob&&(lo.includes('dob')||lo.includes('birth')||lo.includes('date of birth')))
      f.dob=l.replace(/(dob|birth|date\s*of\s*birth|d\.o\.b)[:.\s-]*/i,'').trim();
    else if(!f.dob&&l.match(/^\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}$/))f.dob=l;
    else if(!f.dob&&lo.match(/^\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}$/))f.dob=l;

    /* Blood group */
    if(!f.blood&&l.match(/^(A|B|AB|O)[+-]$/i))f.blood=l.toUpperCase();
    else if(!f.blood&&lo.includes('blood'))f.blood=l.replace(/blood\s*(group)?[:.\s-]*/i,'').trim().toUpperCase();

    /* Gender */
    if(!f.gender&&(lo==='male'||lo==='female'))f.gender=l.charAt(0).toUpperCase()+l.slice(1).toLowerCase();

    /* Section */
    if(!f.section){var m=l.match(/\bSection\s*[:-]?\s*([A-C])\b/i);if(m)f.section=m[1].toUpperCase();}
  }

  /* Fallback: find section near class text */
  if(!f.section){
    for(var i=0;i<lines.length;i++){
      var m=lines[i].match(/\b([A-C])\b/);
      if(m){f.section=m[1];break}
    }
  }

  return f;
}

/* === AUTO-FILL FORM from OCR data === */
function showAutoFillForm(data,raw){
  var sid=data.studentID||('SKPPS'+Date.now().toString(36).toUpperCase());
  var h='<div style="background:white;border-radius:14px;border:2px solid #4ade80;overflow:hidden;animation:fadeIn .3s;margin-bottom:16px">'+
    '<div class="ch" style="color:#059669"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>ID Card Scanned - Details Auto-Filled</div>'+
    '<div class="cb">'+
    '<details style="margin-bottom:10px"><summary style="font-size:10px;color:#9AA0A6;cursor:pointer">View raw OCR text</summary><pre style="font-size:9px;background:#F8F9FA;padding:8px;border-radius:6px;max-height:60px;overflow:auto;margin-top:4px;font-family:monospace;white-space:pre-wrap">'+esc(raw)+'</pre></details>'+
    '<form onsubmit="return saveStudent(event)"><input type="hidden" name="sid" value="'+esc(sid)+'">'+

    /* Row 1: Student ID + Name */
    '<div class="r2">'+
      '<div class="fg"><label>Student ID</label><input name="stid" value="'+esc(sid)+'" class="autofill" readonly style="background:#f0fdf4;color:#065f46"></div>'+
      '<div class="fg"><label>Full Name *</label><input name="name" value="'+esc(data.name)+'" class="autofill" required></div>'+
    '</div>'+

    /* Row 2: Class + Section + Gender */
    '<div class="r2">'+
      '<div class="fg"><label>Class *</label><input name="cls" value="'+esc(data.className)+'" class="autofill" required></div>'+
      '<div class="fg"><label>Section</label><select name="sec"><option '+(data.section==='A'?'selected':'')+'>A</option><option '+(data.section==='B'?'selected':'')+'>B</option><option '+(data.section==='C'?'selected':'')+'>C</option></select></div>'+
    '</div>'+

    /* Row 3: DOB + Blood Group */
    '<div class="r2">'+
      '<div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+esc(data.dob)+'" class="autofill"></div>'+
      '<div class="fg"><label>Blood Group</label><input name="blood" value="'+esc(data.blood)+'" class="autofill"></div>'+
    '</div>'+

    /* Row 4: Father + Phone */
    '<div class="r2">'+
      '<div class="fg"><label>Father Name</label><input name="father" value="'+esc(data.father)+'" class="autofill"></div>'+
      '<div class="fg"><label>Parent Phone</label><input name="phone" value="'+esc(data.phone)+'" type="tel" class="autofill"></div>'+
    '</div>'+

    /* Row 5: House + Gender */
    '<div class="r2">'+
      '<div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div>'+
      '<div class="fg"><label>Gender</label><select name="gender"><option '+(data.gender==='Male'?'selected':'')+'>Male</option><option '+(data.gender==='Female'?'selected':'')+'>Female</option></select></div>'+
    '</div>'+

    '<div style="display:flex;gap:8px;margin-top:12px">'+
      '<button type="submit" class="btn btn-g"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save to Firestore</button>'+
      '<button type="button" class="btn btn-o" onclick="clearRes()">Cancel</button>'+
    '</div></form></div></div>';
  document.getElementById('resultArea').innerHTML=h;
}

function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function showErr(msg){document.getElementById('resultArea').innerHTML='<div style="background:white;border-radius:14px;border:1px solid #E8EAED;overflow:hidden;animation:fadeIn .3s"><div class="ch" style="color:#DC2626">Scan Failed</div><div class="cb"><div class="alert aerr">'+msg+'</div><button onclick="clearRes()" class="btn btn-o">Try Again</button></div></div>'}
window.clearRes=function(){document.getElementById('resultArea').innerHTML='';document.getElementById('procArea').innerHTML=''}

/* === SAVE === */
window.saveStudent=async function(e){
  e.preventDefault();var f=e.target;
  var sid=f.stid.value||f.sid.value||('SKPPS'+Date.now().toString(36).toUpperCase()),name=f.name.value,
      cls=f.cls.value,sec=f.sec.value,dob=f.dob.value||'2000-01-01',
      father=f.father.value,phone=f.phone.value,blood=f.blood.value,house=f.house.value,gender=f.gender.value;
  if(!name||!cls){alert('Name and Class required');return false}
  try{
    await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,
      father_name:father,parent_phone:phone,blood_group:blood,house:house,gender:gender,
      is_active:true,password:dob.replace(/-/g,'').substring(0,8)});
  }catch(e){alert('Save failed: '+e.message);return false}
  document.getElementById('resultArea').innerHTML='<div style="background:white;border-radius:14px;border:2px solid #059669;overflow:hidden;animation:fadeIn .3s"><div class="ch" style="color:#059669">Saved!</div><div class="cb"><p><strong>'+esc(name)+'</strong> added to Firestore.</p><p style="font-size:11px;color:#5F6368;margin-top:4px">ID: '+esc(sid)+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p><button onclick="clearRes()" class="btn btn-o mt1">Scan Another</button></div></div>';
  loadDB();return false
};

/* === BULK IMPORT === */
function renderBulk(){return'<div class="card"><div class="ch">Bulk Import (CSV)</div><div class="cb"><p style="font-size:11px;color:#5F6368;margin-bottom:8px">Format: ID,Name,Class,Section,DOB,Father,Mother,Phone,Gender,House</p><textarea id="csvIn" style="width:100%;height:160px;border:1.5px solid #DADCE0;border-radius:8px;padding:10px;font-family:monospace;font-size:10px"></textarea><button class="btn btn-b mt1" onclick="doImport()">Import to Firestore</button><div id="csvMsg" class="mt1"></div></div></div>'}
window.doImport=async function(){var t=document.getElementById('csvIn').value.trim();if(!t)return;var lines=t.split('\n').filter(Boolean),added=0,skip=0;for(var i=0;i<lines.length;i++){var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<5){skip++;continue}var sid=c[0]||('SKPPS'+Date.now().toString(36).toUpperCase()),name=c[1],cls=c[2],sec=c[3]||'A',dob=c[4]||'2000-01-01',father=c[5]||'',mother=c[6]||'',phone=c[7]||'',gender=c[8]||'Male',house=c[9]||'Earth';if(!name||!cls){skip++;continue}try{await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,mother_name:mother,parent_phone:phone,gender:gender,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});added++}catch(e){skip++}}document.getElementById('csvMsg').innerHTML='<div class="alert aok">Imported: '+added+'. Skipped: '+skip+'</div>';loadDB()}

/* === TEACHERS === */
function renderTeachers(){var rows='';if(!teachers.length)rows='<tr><td colspan="3" style="text-align:center;padding:24px;color:#9AA0A6">No teachers yet</td></tr>';else for(var i=0;i<teachers.length;i++){var t=teachers[i];rows+='<tr><td><strong>'+esc(t.full_name)+'</strong></td><td>'+esc(t.username)+'</td><td><span class="badge-sm bg">Active</span></td></tr>'}return'<div class="card"><div class="ch">Teachers</div><div class="cb"><form onsubmit="return addTchr(event)"><div class="r2"><div class="fg"><label>Full Name</label><input id="tn" required></div><div class="fg"><label>Username</label><input id="tu" required></div></div><div class="r2"><div class="fg"><label>Password</label><input type="password" id="tpw" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te"></div></div><button type="submit" class="btn btn-b mt1">Add Teacher</button></form><div class="tw"><table class="dt"><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>'}
window.addTchr=async function(e){e.preventDefault();var n=document.getElementById('tn').value.trim(),u=document.getElementById('tu').value.trim(),p=document.getElementById('tpw').value.trim(),em=document.getElementById('te').value.trim();try{await fbAddTeacher({username:u,password:p,full_name:n,email:em,is_active:true})}catch(er){alert('Failed: '+er.message);return false}loadDB();return false}

/* === ALL STUDENTS === */
function renderAll(){var rows='';if(!students.length)rows='<tr><td colspan="8" style="text-align:center;padding:30px;color:#9AA0A6">No students yet</td></tr>';else for(var i=0;i<students.length;i++){var s=students[i],hc=s.house||'Earth';rows+='<tr><td>'+esc(s.student_id)+'</td><td><strong>'+esc(s.full_name)+'</strong></td><td>'+esc(s.class)+'</td><td>'+esc(s.section||'')+'</td><td>'+esc(s.date_of_birth||'')+'</td><td><span class="badge-sm '+(hc==='Earth'?'bg':hc==='Fire'?'br':hc==='Water'?'bb':'by')+'">'+hc+'</span></td><td>'+esc(s.parent_phone||'')+'</td><td style="font-size:9px">'+esc(s.blood_group||'')+'</td></tr>'}return'<div class="card"><div class="ch">All Students ('+students.length+')</div><div class="cb"><input style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:10px" placeholder="Search..." oninput="filterTbl(this.value)"><div class="tw"><table class="dt" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Section</th><th>DOB</th><th>House</th><th>Phone</th><th>Blood</th></tr>'+rows+'</table></div></div></div>'}
window.filterTbl=function(q){var r=document.querySelectorAll('#stbl tr');for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'}

/* === INIT === */
loadDB();
setTimeout(function(){getOCR().catch(function(){})},1500);
})();
