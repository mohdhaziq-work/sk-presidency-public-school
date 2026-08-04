/* SKPPS Management Panel v6 — Production Ready */
(function(){"use strict";
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('uname').textContent=' - '+(sessionStorage.getItem('skpps_name')||'Admin');

var students=[],teachers=[],curTab='scan',camStream=null,_ocrWorker=null,_ocrReady=false;

/* === TESSERACT WORKER - LAZY LOAD + REUSE === */
async function getOCR(){
  if(_ocrWorker) return _ocrWorker;
  _ocrWorker = await Tesseract.createWorker('eng');
  _ocrReady = true;
  return _ocrWorker;
}
function ocrProgress(msg,pct){var b=document.getElementById('ocrBar'),t=document.getElementById('ocrText');if(b)b.style.width=(pct||0)+'%';if(t)t.textContent=msg||''}

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
  h+='<div class="tab-bar">'+tb('scan','Scanner')+tb('bulk','Import')+tb('teacher','Teachers')+tb('all','All Students')+'</div>';
  if(curTab==='scan')h+=rScan();else if(curTab==='bulk')h+=rBulk();else if(curTab==='teacher')h+=rTeachers();else h+=rAll();
  document.getElementById('mc').innerHTML=h;
}
function tb(id,lbl){return'<button class="'+(curTab===id?'active':'')+'" onclick="navTo(\''+id+'\')">'+lbl+'</button>'}

/* === SCANNER === */
function rScan(){
  return'<div class="scan-options">'+
    '<div class="scan-opt" onclick="document.getElementById(\'fileInp\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><h3>Upload Photo</h3><p>Select ID card image from your device</p><input type="file" id="fileInp" accept="image/*" onchange="handleUpload(event)"></div>'+
    '<div class="scan-opt" onclick="openCam()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><h3>Take Photo</h3><p>Use camera to capture ID card</p></div>'+
  '</div><div id="procArea"></div><div id="resultArea"></div>';
}

/* === UPLOAD === */
window.handleUpload=function(e){var f=e.target.files[0];if(!f)return;showProc();processImage(f);e.target.value=''};
function showProc(){document.getElementById('procArea').innerHTML='<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;padding:16px;text-align:center;margin-bottom:12px"><p style="font-size:12px;color:#5F6368;margin-bottom:8px">Reading ID card...</p><div class="progress-wrap"><div class="progress-fill" id="ocrBar" style="width:0%"></div></div><p style="font-size:10px;color:#9AA0A6;margin-top:6px" id="ocrText">Loading OCR engine...</p></div>';document.getElementById('resultArea').innerHTML=''}

async function processImage(file){
  try{
    var img=await new Promise(function(ok,fail){var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){ok(i)};i.onerror=fail;i.src=r.result};r.onerror=fail;r.readAsDataURL(file)});
    ocrProgress('Loading OCR engine...',5);
    var worker=await getOCR();
    ocrProgress('Reading text...',15);
    var result=await worker.recognize(img);
    ocrProgress('Complete!',100);
    showResult(parseCard(result.data.text),result.data.text);
  }catch(e){showErr('Failed to read image. Try again.')}
  setTimeout(function(){document.getElementById('procArea').innerHTML=''},600);
}

/* === CAMERA === */
window.openCam=function(){document.getElementById('camModal').classList.add('open');var v=document.getElementById('camVid');navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}}).then(function(s){camStream=s;v.srcObject=s}).catch(function(){alert('Camera unavailable');closeCam()})};
window.closeCam=function(){document.getElementById('camModal').classList.remove('open');if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null}};
window.capturePhoto=function(){var v=document.getElementById('camVid');if(!v||v.readyState<2)return;var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);closeCam();c.toBlob(function(blob){showProc();processImage(blob)},'image/jpeg',0.85)};

/* === OCR PARSER === */
function parseCard(text){
  var clean=text.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@]/g,' ').replace(/\s+/g,' ').trim();
  var words=clean.split(/\s+/).filter(function(w){return w.length>1}),lines=clean.split(/\n/).map(function(l){return l.trim()}).filter(Boolean);
  var f={name:'',cls:'',sec:'',roll:'',sid:'',father:'',phone:'',dob:'',blood:''};
  for(var i=0;i<words.length-1;i++){if(!f.name&&/^[A-Z][a-z]{2,}$/.test(words[i])&&/^[A-Z][a-z]{2,}$/.test(words[i+1])){if(!/^(Class|Roll|Father|Mother|Blood|Phone|House|Student|Admission|Date|DOB|Name|Gender)$/i.test(words[i]))f.name=words[i]+' '+words[i+1]}}
  for(var i=0;i<lines.length;i++){var l=lines[i],lo=l.toLowerCase().replace(/[:\s]+/g,' ').trim();
    if(!f.cls&&/^(nursery|lkg|ukg|[ivx]+)$/i.test(l))f.cls=l.toUpperCase();else if(!f.cls&&lo.startsWith('class'))f.cls=lo.replace('class','').trim().toUpperCase();
    if(!f.roll&&lo.startsWith('roll'))f.roll=lo.replace(/roll\s*(no|number)?/,'').trim();else if(!f.roll&&/^\d{1,3}$/.test(l)&&parseInt(l)>0&&parseInt(l)<=100)f.roll=l;
    if(!f.sid&&(lo.includes('student id')||lo.startsWith('id')||lo.startsWith('adm')))f.sid=lo.replace(/student\s*id|admission\s*(no)?|adm\s*(no)?|id\s*(no)?/,'').trim();else if(!f.sid&&/^skpps/i.test(l))f.sid=l;
    if(!f.father&&lo.startsWith('father'))f.father=lo.replace(/father\s*(name|'s\s*name)?/,'').trim();
    if(!f.phone&&l.replace(/\D/g,'').match(/^\d{10}$/))f.phone=l.replace(/\D/g,'');
    if(!f.dob&&(lo.includes('dob')||lo.startsWith('birth')||lo.startsWith('date')))f.dob=lo.replace(/dob|birth|date\s*of\s*birth|d\.o\.b/,'').trim();else if(!f.dob&&/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(l))f.dob=l;
    if(!f.blood&&/^(A|B|AB|O)[+-]$/i.test(l))f.blood=l.toUpperCase()}
  if(!f.sec)for(var i=0;i<lines.length;i++){var m=lines[i].match(/\b([A-C])\b/);if(m){f.sec=m[1];break}}
  return f
}

/* === SHOW RESULT === */
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function showResult(data,raw){
  var sid=data.sid||('SKPPS'+Date.now().toString(36).toUpperCase());
  document.getElementById('resultArea').innerHTML='<div style="background:white;border-radius:14px;border:2px solid #4ade80;overflow:hidden;animation:fadeIn .3s"><div class="ch" style="color:#059669">ID Card Detected</div><div class="cb"><details style="margin-bottom:10px"><summary style="font-size:10px;color:#9AA0A6;cursor:pointer">OCR text</summary><pre style="font-size:9px;background:#F8F9FA;padding:8px;border-radius:6px;max-height:60px;overflow:auto;margin-top:4px;font-family:monospace;white-space:pre-wrap">'+esc(raw)+'</pre></details><form onsubmit="return saveStudent(event)"><input type="hidden" name="sid" value="'+sid+'"><div class="r2"><div class="fg"><label>Student ID</label><input name="stid" value="'+esc(sid)+'"></div><div class="fg"><label>Full Name *</label><input name="name" value="'+esc(data.name)+'" required autofocus></div></div><div class="r3"><div class="fg"><label>Class *</label><input name="cls" value="'+esc(data.cls)+'" required></div><div class="fg"><label>Section</label><select name="sec"><option '+(data.sec==='A'?'selected':'')+'>A</option><option '+(data.sec==='B'?'selected':'')+'>B</option><option '+(data.sec==='C'?'selected':'')+'>C</option></select></div><div class="fg"><label>Roll No</label><input name="roll" value="'+esc(data.roll)+'"></div></div><div class="r2"><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+esc(data.dob)+'"></div><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div></div><div class="r2"><div class="fg"><label>Father</label><input name="father" value="'+esc(data.father)+'"></div><div class="fg"><label>Blood Group</label><input name="blood" value="'+esc(data.blood)+'"></div></div><div class="fg"><label>Phone</label><input name="phone" value="'+esc(data.phone)+'" type="tel"></div><div style="display:flex;gap:8px;margin-top:10px"><button type="submit" class="btn btn-g">Save to Firestore</button><button type="button" class="btn btn-o" onclick="clearRes()">Cancel</button></div></form></div></div>'
}
function showErr(msg){document.getElementById('resultArea').innerHTML='<div style="background:white;border-radius:14px;border:1px solid #E8EAED;overflow:hidden;animation:fadeIn .3s"><div class="ch" style="color:#DC2626">Scan Failed</div><div class="cb"><div class="alert aerr">'+msg+'</div><button onclick="clearRes()" class="btn btn-o">Try Again</button></div></div>'}
window.clearRes=function(){document.getElementById('resultArea').innerHTML='';document.getElementById('procArea').innerHTML=''}

/* === SAVE === */
window.saveStudent=async function(e){
  e.preventDefault();var f=e.target;
  var sid=f.stid.value||f.sid.value||('SKPPS'+Date.now().toString(36).toUpperCase()),name=f.name.value,cls=f.cls.value,sec=f.sec.value,roll=parseInt(f.roll.value)||0,dob=f.dob.value||'2000-01-01',father=f.father.value,phone=f.phone.value,blood=f.blood.value,house=f.house.value;
  if(!name||!cls){alert('Name and Class required');return false}
  try{await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,father_name:father,parent_phone:phone,blood_group:blood,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8)})}catch(e){alert('Save failed: '+e.message);return false}
  document.getElementById('resultArea').innerHTML='<div style="background:white;border-radius:14px;border:2px solid #059669;overflow:hidden;animation:fadeIn .3s"><div class="ch" style="color:#059669">Saved!</div><div class="cb"><p><strong>'+esc(name)+'</strong> added to Firestore.</p><p style="font-size:11px;color:#5F6368;margin-top:4px">ID: '+esc(sid)+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p><button onclick="clearRes()" class="btn btn-o mt1">Scan Another</button></div></div>';
  loadDB();return false
}

/* === BULK === */
function rBulk(){return'<div class="card"><div class="ch">Bulk Import (CSV)</div><div class="cb"><p style="font-size:11px;color:#5F6368;margin-bottom:8px">Format: ID,Name,Class,Section,Roll,DOB(YYYY-MM-DD),Father,Mother,Phone,Gender,House</p><textarea id="csvIn" style="width:100%;height:160px;border:1.5px solid #DADCE0;border-radius:8px;padding:10px;font-family:monospace;font-size:10px"></textarea><button class="btn btn-b mt1" onclick="doImport()">Import to Firestore</button><div id="csvMsg" class="mt1"></div></div></div>'}
window.doImport=async function(){var t=document.getElementById('csvIn').value.trim();if(!t)return;var lines=t.split('\n').filter(Boolean),added=0,skip=0;for(var i=0;i<lines.length;i++){var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<6){skip++;continue}var sid=c[0]||('SKPPS'+Date.now().toString(36).toUpperCase()),name=c[1],cls=c[2],sec=c[3]||'A',roll=parseInt(c[4])||0,dob=c[5]||'2000-01-01',father=c[6]||'',mother=c[7]||'',phone=c[8]||'',house=c[10]||'Earth';if(!name||!cls){skip++;continue}try{await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,father_name:father,mother_name:mother,parent_phone:phone,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});added++}catch(e){skip++}}document.getElementById('csvMsg').innerHTML='<div class="alert aok">Imported: '+added+'. Skipped: '+skip+'</div>';loadDB()}

/* === TEACHERS === */
function rTeachers(){var rows='';if(!teachers.length)rows='<tr><td colspan="3" style="text-align:center;padding:24px;color:#9AA0A6">No teachers yet</td></tr>';else for(var i=0;i<teachers.length;i++){var t=teachers[i];rows+='<tr><td><strong>'+esc(t.full_name)+'</strong></td><td>'+esc(t.username)+'</td><td><span class="badge-sm bg">Active</span></td></tr>'}return'<div class="card"><div class="ch">Teachers</div><div class="cb"><form onsubmit="return addTchr(event)"><div class="r2"><div class="fg"><label>Full Name</label><input id="tn" required></div><div class="fg"><label>Username</label><input id="tu" required></div></div><div class="r2"><div class="fg"><label>Password</label><input type="password" id="tpw" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te"></div></div><button type="submit" class="btn btn-b mt1">Add Teacher</button></form><div class="tw"><table class="dt"><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>'}
window.addTchr=async function(e){e.preventDefault();var n=document.getElementById('tn').value.trim(),u=document.getElementById('tu').value.trim(),p=document.getElementById('tpw').value.trim(),em=document.getElementById('te').value.trim();try{await fbAddTeacher({username:u,password:p,full_name:n,email:em,is_active:true})}catch(er){alert('Failed: '+er.message);return false}loadDB();return false}

/* === ALL STUDENTS === */
function rAll(){var rows='';if(!students.length)rows='<tr><td colspan="8" style="text-align:center;padding:30px;color:#9AA0A6">No students yet</td></tr>';else for(var i=0;i<students.length;i++){var s=students[i],hc=s.house||'Earth';rows+='<tr><td>'+esc(s.student_id)+'</td><td><strong>'+esc(s.full_name)+'</strong></td><td>'+esc(s.class)+'</td><td>'+esc(s.section)+'</td><td>'+(s.roll_no||'')+'</td><td><span class="badge-sm '+(hc==='Earth'?'bg':hc==='Fire'?'br':hc==='Water'?'bb':'by')+'">'+hc+'</span></td><td>'+esc(s.parent_phone||'')+'</td><td style="font-size:10px">'+esc(s.date_of_birth||'')+'</td></tr>'}return'<div class="card"><div class="ch">All Students ('+students.length+')</div><div class="cb"><input style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:10px" placeholder="Search students..." oninput="filterTbl(this.value)"><div class="tw"><table class="dt" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>Roll</th><th>House</th><th>Phone</th><th>DOB</th></tr>'+rows+'</table></div></div></div>'}
window.filterTbl=function(q){var r=document.querySelectorAll('#stbl tr');for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'}

loadDB();
setTimeout(function(){getOCR().catch(function(){})},1500);
})();
