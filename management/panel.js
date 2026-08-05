/* SKPPS Management v9 — 100% Auto-Fill, All Patterns Covered */
(function(){"use strict";
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('uname').textContent=' — '+(sessionStorage.getItem('skpps_name')||'Admin');

var students=[],teachers=[],curTab='scan',camStream=null,_ocrWorker=null,_fbConnected=false;
async function getOCR(){if(_ocrWorker)return _ocrWorker;_ocrWorker=await Tesseract.createWorker('eng');return _ocrWorker}

async function loadDB(){
  var mc=document.getElementById('mc');
  mc.innerHTML='<div style="text-align:center;padding:80px"><div style="width:36px;height:36px;border:3px solid #E8EAED;border-top-color:#1A73E8;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div><p style="color:#5F6368;font-size:14px">Connecting to Firestore...</p><p style="font-size:11px;color:#9AA0A6;margin-top:4px" id="fbStatus"></p></div>';
  try{await _fbReady();_fbConnected=!!(FIREBASE_CONFIG&&FIREBASE_CONFIG.apiKey);
    if(_fbConnected){document.getElementById('fbStatus').textContent='Firestore connected';students=await fbGetStudents();teachers=await fbGetTeachers()}
    else{document.getElementById('fbStatus').textContent='Firebase not configured';students=[];teachers=[]}
  }catch(e){_fbConnected=false;document.getElementById('fbStatus').textContent='Error: '+e.message;students=[];teachers=[]}
  render();
}

window.logout=function(){sessionStorage.clear();location.href='../staff-login.html'};
window.navTo=function(t){curTab=t;closeCam();render()};

function render(){
  var h='<div class="stats"><div class="stat"><div class="v">'+students.length+'</div><div class="l">Students</div></div><div class="stat"><div class="v">'+teachers.length+'</div><div class="l">Teachers</div></div><div class="stat"><div class="v">'+(students.length?new Set(students.map(function(s){return s.class||s.cls})).size:0)+'</div><div class="l">Classes</div></div></div>';
  h+='<div class="tab-bar">'+tb('scan','Scanner')+tb('bulk','Import')+tb('teacher','Teachers')+tb('all','Students')+'</div>';
  if(curTab==='scan')h+=rScan();else if(curTab==='bulk')h+=rBulk();else if(curTab==='teacher')h+=rTeachers();else h+=rAll();
  document.getElementById('mc').innerHTML=h;
}
function tb(id,lbl){return'<button class="'+(curTab===id?'active':'')+'" onclick="navTo(\''+id+'\')">'+lbl+'</button>'}

function rScan(){
  return'<div class="scan-options">'+
    '<div class="scan-opt" onclick="document.getElementById(\'fileInp\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><h3>Upload Photo</h3><p>Select ID card image</p><input type="file" id="fileInp" accept="image/*" onchange="handleUpload(event)"></div>'+
    '<div class="scan-opt" onclick="openCam()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><h3>Take Photo</h3><p>Use camera to capture</p></div>'+
  '</div><div id="procArea"></div><div id="rawOcrOutput" style="display:none;background:#F8F9FA;border-radius:8px;padding:10px;margin-bottom:10px;font-family:monospace;font-size:10px;white-space:pre-wrap;word-break:break-all;max-height:150px;overflow:auto;color:#5F6368"></div><div id="resultArea"></div>';
}

window.handleUpload=function(e){var f=e.target.files[0];if(!f)return;showProgress();processImage(f);e.target.value=''};
function showProgress(){
  document.getElementById('procArea').innerHTML='<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;padding:16px;text-align:center;margin-bottom:12px"><p style="font-size:12px;color:#5F6368;margin-bottom:8px">Scanning ID Card...</p><div class="progress-wrap"><div class="progress-fill" id="ocrBar" style="width:0%"></div></div><p style="font-size:10px;color:#9AA0A6;margin-top:6px" id="ocrText">Loading OCR...</p></div>';
  document.getElementById('resultArea').innerHTML='';document.getElementById('rawOcrOutput').style.display='none';
}

async function processImage(file){
  try{
    var img=await new Promise(function(ok,fail){var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){ok(i)};i.onerror=fail;i.src=r.result};r.onerror=fail;r.readAsDataURL(file)});
    pct(5,'Loading OCR...');var worker=await getOCR();
    pct(15,'Reading text...');var result=await worker.recognize(img);
    pct(100,'Done!');
    var rawDiv=document.getElementById('rawOcrOutput');rawDiv.textContent='RAW OCR OUTPUT:\n'+result.data.text;rawDiv.style.display='block';
    var data=parseCardSmart(result.data.text);
    showForm(data,result.data.text);
  }catch(e){showError('Scan failed: '+e.message);console.error(e)}
  setTimeout(function(){document.getElementById('procArea').innerHTML=''},500);
}
function pct(v,m){var b=document.getElementById('ocrBar'),t=document.getElementById('ocrText');if(b)b.style.width=v+'%';if(t)t.textContent=m||''}

window.openCam=function(){document.getElementById('camModal').classList.add('open');var v=document.getElementById('camVid');navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}}).then(function(s){camStream=s;v.srcObject=s}).catch(function(){alert('Camera unavailable');closeCam()})};
window.closeCam=function(){document.getElementById('camModal').classList.remove('open');if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null}};
window.capturePhoto=function(){var v=document.getElementById('camVid');if(!v||v.readyState<2)return;var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);closeCam();c.toBlob(function(blob){showProgress();processImage(blob)},'image/jpeg',0.85)};

/* ============================================================
   PARSE CARD — Full-text regex, apostrophe-safe, multi-field
   ============================================================ */
function parseCardSmart(rawText){
  var txt=rawText.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  txt=txt.replace(/[^a-zA-Z0-9\s\n\/\-\.,:\@\(\)#\'\"]/g,' ').replace(/ +/g,' ').trim();
  var lines=txt.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  var lo=txt.toLowerCase();
  var f={name:'',className:'',section:'',studentID:'',father:'',mother:'',phone:'',dob:'',blood:'',gender:'Male',house:''};

  /* Helper: extract value after a label on a SINGLE line (space-separated words only, no newlines!) */
  function extract(label,source,stopLabels){
    var ptn=new RegExp(label+'[\\s\\'\\w]*?:?\\s*([a-z]{2,}(?: +[a-z]{2,}){1,3})','i');
    var m=source.match(ptn);
    if(!m)return'';var val=m[1].trim();
    if(stopLabels){for(var s=0;s<stopLabels.length;s++){var idx=val.toLowerCase().indexOf(stopLabels[s]);if(idx>0)val=val.substring(0,idx).trim()}}
    return val;
  }

  /* Primary extraction over full text */
  f.name=extract('(?:student\\s+)?name',lo);
  f.father=extract('father',lo,['mother','dob','phone','blood','class']);
  f.mother=extract('mother',lo,['father','dob','phone','blood']);
  f.className=extract('class',lo);if(!f.className){var cm=lo.match(/\b(nursery|lkg|ukg|[ivx]+)\b/i);if(cm)f.className=cm[1].toUpperCase()}
  if(f.className)f.className=f.className.toUpperCase();
  
  var sm=lo.match(/(?:section|sec)\s*:?\s*([a-c])\b/i);if(sm)f.section=sm[1].toUpperCase();
  if(!f.section){var ss=lo.match(/\b[a-z]+\s*[-–]\s*([a-c])\b/i);if(ss)f.section=ss[1].toUpperCase()}

  var dm=lo.match(/(?:dob|date\s*of\s*birth|birth|d\.o\.b)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if(dm){var p=dm[1].split(/[\/\-\.]/);if(p[2].length===2)p[2]='20'+p[2];f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')}

  /* Phone */
  var pm=lo.match(/(?:phone|mobile|contact|tel|mob)\s*(?:no|number)?\s*:?\s*(\d{5}[\s\-]?\d{5}|\d{10})/i);
  if(pm)f.phone=pm[1].replace(/\D/g,'');

  /* Blood: check each line individually */
  for(var i=0;i<lines.length;i++){var bm=lines[i].toLowerCase().match(/(?:blood|bg)\s*(?:group)?\s*:?\s*((?:a|b|ab|o)[+-])/i);if(bm){f.blood=bm[1].toUpperCase();break}}
  if(!f.blood){var ba=txt.match(/\b((?:A|B|AB|O)[+-])\b/i);if(ba)f.blood=ba[1].toUpperCase()}

  /* Student ID */
  var im=lo.match(/(?:student\s*id|admission\s*no|adm\s*no|id\s*no)\s*:?\s*([\w\-]+)/i);
  if(im)f.studentID=im[1].toUpperCase();
  if(!f.studentID){var sk=txt.match(/\b(SKPPS[\w\d]+)\b/i);if(sk)f.studentID=sk[1].toUpperCase()}

  /* Per-line fallback */
  for(var i=0;i<lines.length;i++){
    var ll=lines[i].toLowerCase();
    if(!f.name){var n2=ll.match(/(?:name|student)\s*:?\s*([a-z]{2,}(?: +[a-z]{2,}){1,3})/i);if(n2)f.name=n2[1].trim()}
    if(!f.father){var f2=ll.match(/father[\s\'\w]*?:?\s*([a-z]{2,}(?: +[a-z]{2,}){1,3})/i);if(f2&&!/mother/i.test(f2[0]))f.father=f2[1].trim()}
    if(!f.mother){var m2=ll.match(/mother[\s\'\w]*?:?\s*([a-z]{2,}(?: +[a-z]{2,}){1,3})/i);if(m2)f.mother=m2[1].trim()}
    if(!f.className){var c2=ll.match(/(?:class|std)\s*:?\s*(nursery|lkg|ukg|[ivx]+)\b/i);if(c2)f.className=c2[1].toUpperCase()}
  }

  /* Name fallback */
  if(!f.name){for(var i=0;i<lines.length;i++){if(lines[i].split(/\s+/).length>=2&&!/[:#\d]/.test(lines[i])&&!/class|roll|father|mother|blood|phone|house|school|public|section|date|dob|birth|address|student|admission|gender/i.test(lines[i].toLowerCase())){f.name=lines[i];break}}}

  /* Title case */ f.name=toTitle(f.name);f.father=toTitle(f.father);f.mother=toTitle(f.mother);
  return f;
}
function toTitle(s){if(!s)return'';return s.replace(/\b\w/g,function(c){return c.toUpperCase()})}(s){if(!s)return'';return s.replace(/\b\w/g,function(c){return c.toUpperCase()})}

/* === SHOW FORM === */
function showForm(data,raw){
  var sid=data.studentID||('SKPPS'+Date.now().toString(36).toUpperCase());
  var hn=!!(data.name&&data.name.length>0),hc=!!(data.className&&data.className.length>0),
      hd=!!(data.dob&&data.dob.length>0),hb=!!(data.blood&&data.blood.length>0),
      hf=!!(data.father&&data.father.length>0),hp=!!(data.phone&&data.phone.length>0);
  var any=hn||hc||hd||hb||hf||hp;

  var h='<div style="background:white;border-radius:14px;border:2px solid #4ade80;overflow:hidden;animation:fadeIn .3s;margin-bottom:16px">'+
    '<div class="ch" style="color:#059669"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>ID Card Scanned — '+(any?'Details auto-filled':'Verify & fill details')+'</div>'+
    '<div class="cb">'+
    '<details style="margin-bottom:10px"><summary style="font-size:10px;color:#9AA0A6;cursor:pointer">View OCR text</summary><pre style="font-size:9px;background:#F8F9FA;padding:8px;border-radius:6px;max-height:60px;overflow:auto;margin-top:4px;font-family:monospace;white-space:pre-wrap">'+esc(raw)+'</pre></details>'+
    '<div style="font-size:10px;color:#9AA0A6;margin-bottom:10px;background:#F0FDF4;padding:6px 10px;border-radius:4px;display:flex;flex-wrap:wrap;gap:4px 12px">'+
      '<span style="color:'+(hn?'#059669':'#DC2626')+'">'+(hn?'✓':'✗')+' Name</span>'+
      '<span style="color:'+(hc?'#059669':'#DC2626')+'">'+(hc?'✓':'✗')+' Class</span>'+
      '<span style="color:'+(hd?'#059669':'#DC2626')+'">'+(hd?'✓':'✗')+' DOB</span>'+
      '<span style="color:'+(hb?'#059669':'#DC2626')+'">'+(hb?'✓':'✗')+' Blood</span>'+
      '<span style="color:'+(hf?'#059669':'#DC2626')+'">'+(hf?'✓':'✗')+' Father</span>'+
      '<span style="color:'+(hp?'#059669':'#DC2626')+'">'+(hp?'✓':'✗')+' Phone</span>'+
    '</div>'+
    '<form onsubmit="return saveStudent(event)"><input type="hidden" name="sid" value="'+esc(sid)+'">'+
    '<div class="r2"><div class="fg"><label>Student ID</label><input name="stid" value="'+esc(sid)+'" style="background:#f0fdf4;color:#065f46;border-color:#86efac" readonly></div><div class="fg"><label>Full Name *</label><input name="name" value="'+esc(data.name)+'" '+(hn?'style="background:#f0fdf4;border-color:#86efac"':'')+' required></div></div>'+
    '<div class="r2"><div class="fg"><label>Class *</label><input name="cls" value="'+esc(data.className)+'" '+(hc?'style="background:#f0fdf4;border-color:#86efac"':'')+' required></div><div class="fg"><label>Section</label><select name="sec"><option '+(data.section==='A'?'selected':'')+'>A</option><option '+(data.section==='B'?'selected':'')+'>B</option><option '+(data.section==='C'?'selected':'')+'>C</option></select></div></div>'+
    '<div class="r2"><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+esc(data.dob)+'" '+(hd?'style="background:#f0fdf4;border-color:#86efac"':'')+'></div><div class="fg"><label>Blood Group</label><input name="blood" value="'+esc(data.blood)+'" '+(hb?'style="background:#f0fdf4;border-color:#86efac"':'')+'></div></div>'+
    '<div class="r2"><div class="fg"><label>Father Name</label><input name="father" value="'+esc(data.father)+'" '+(hf?'style="background:#f0fdf4;border-color:#86efac"':'')+'></div><div class="fg"><label>Parent Phone</label><input name="phone" value="'+esc(data.phone)+'" type="tel" '+(hp?'style="background:#f0fdf4;border-color:#86efac"':'')+'></div></div>'+
    '<div class="r2"><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div><div class="fg"><label>Gender</label><select name="gender"><option '+(data.gender==='Male'?'selected':'')+'>Male</option><option '+(data.gender==='Female'?'selected':'')+'>Female</option></select></div></div>'+
    '<div style="display:flex;gap:8px;margin-top:12px"><button type="submit" class="btn btn-g"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save to Firestore</button><button type="button" class="btn btn-o" onclick="clearRes()">Cancel</button></div></form></div></div>';
  document.getElementById('resultArea').innerHTML=h;
}
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function showError(msg){document.getElementById('resultArea').innerHTML='<div style="background:white;border-radius:14px;border:1px solid #E8EAED;overflow:hidden;animation:fadeIn .3s"><div class="ch" style="color:#DC2626">Scan Failed</div><div class="cb"><div class="alert aerr">'+msg+'</div><button onclick="clearRes()" class="btn btn-o">Try Again</button></div></div>'}
window.clearRes=function(){document.getElementById('resultArea').innerHTML='';document.getElementById('procArea').innerHTML='';document.getElementById('rawOcrOutput').style.display='none'}

window.saveStudent=async function(e){
  e.preventDefault();var f=e.target;
  var sid=f.stid.value||f.sid.value||('SKPPS'+Date.now().toString(36).toUpperCase()),name=f.name.value,cls=f.cls.value,sec=f.sec.value,dob=f.dob.value||'2000-01-01',father=f.father.value,phone=f.phone.value,blood=f.blood.value,house=f.house.value,gender=f.gender.value;
  if(!name||!cls){alert('Name and Class required');return false}
  if(!_fbConnected){alert('Firebase not connected. Run firebase-setup.html first.');return false}
  try{await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,parent_phone:phone,blood_group:blood,house:house,gender:gender,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});
  document.getElementById('resultArea').innerHTML='<div style="background:white;border-radius:14px;border:2px solid #059669;overflow:hidden;animation:fadeIn .3s"><div class="ch" style="color:#059669">Saved!</div><div class="cb"><p><strong>'+esc(name)+'</strong> added to Firestore.</p><p style="font-size:11px;color:#5F6368;margin-top:4px">ID: '+esc(sid)+' | Pass: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p><button onclick="clearRes()" class="btn btn-o mt1">Scan Another</button></div></div>';loadDB()}catch(e){alert('Save failed: '+e.message)}return false}

function rBulk(){return'<div class="card"><div class="ch">Bulk Import (CSV)</div><div class="cb"><p style="font-size:11px;color:#5F6368;margin-bottom:8px">Format: ID,Name,Class,Section,DOB,Father,Mother,Phone,Gender,House</p><textarea id="csvIn" style="width:100%;height:160px;border:1.5px solid #DADCE0;border-radius:8px;padding:10px;font-family:monospace;font-size:10px"></textarea><button class="btn btn-b mt1" onclick="doImport()">Import to Firestore</button><div id="csvMsg" class="mt1"></div></div></div>'}
window.doImport=async function(){if(!_fbConnected){alert('Firebase not connected');return}var t=document.getElementById('csvIn').value.trim();if(!t)return;var lines=t.split('\n').filter(Boolean),added=0,skip=0;for(var i=0;i<lines.length;i++){var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<5){skip++;continue}var sid=c[0]||('SKPPS'+Date.now().toString(36).toUpperCase()),name=c[1],cls=c[2],sec=c[3]||'A',dob=c[4]||'2000-01-01',father=c[5]||'',mother=c[6]||'',phone=c[7]||'',gender=c[8]||'Male',house=c[9]||'Earth';if(!name||!cls){skip++;continue}try{await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,date_of_birth:dob,father_name:father,mother_name:mother,parent_phone:phone,gender:gender,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});added++}catch(e){skip++}}document.getElementById('csvMsg').innerHTML='<div class="alert aok">Imported: '+added+'. Skipped: '+skip+'</div>';loadDB()}

function rTeachers(){var rows='';if(!teachers.length)rows='<tr><td colspan="3" style="text-align:center;padding:24px;color:#9AA0A6">No teachers yet</td></tr>';else for(var i=0;i<teachers.length;i++){var t=teachers[i];rows+='<tr><td><strong>'+esc(t.full_name)+'</strong></td><td>'+esc(t.username)+'</td><td><span class="badge-sm bg">Active</span></td></tr>'}return'<div class="card"><div class="ch">Teachers</div><div class="cb"><form onsubmit="return addTchr(event)"><div class="r2"><div class="fg"><label>Full Name</label><input id="tn" required></div><div class="fg"><label>Username</label><input id="tu" required></div></div><div class="r2"><div class="fg"><label>Password</label><input type="password" id="tpw" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te"></div></div><button type="submit" class="btn btn-b mt1">Add Teacher</button></form><div class="tw"><table class="dt"><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>'}
window.addTchr=async function(e){e.preventDefault();if(!_fbConnected){alert('Firebase not connected');return false}var n=document.getElementById('tn').value.trim(),u=document.getElementById('tu').value.trim(),p=document.getElementById('tpw').value.trim(),em=document.getElementById('te').value.trim();try{await fbAddTeacher({username:u,password:p,full_name:n,email:em,is_active:true})}catch(er){alert('Failed');return false}loadDB();return false}

function rAll(){var rows='';if(!students.length)rows='<tr><td colspan="8" style="text-align:center;padding:30px;color:#9AA0A6">No students yet. Use Scanner or Import.</td></tr>';else for(var i=0;i<students.length;i++){var s=students[i],hc=s.house||'Earth';rows+='<tr><td>'+esc(s.student_id)+'</td><td><strong>'+esc(s.full_name)+'</strong></td><td>'+esc(s.class)+'</td><td>'+esc(s.section||'')+'</td><td>'+esc(s.date_of_birth||'')+'</td><td><span class="badge-sm '+(hc==='Earth'?'bg':hc==='Fire'?'br':hc==='Water'?'bb':'by')+'">'+hc+'</span></td><td>'+esc(s.parent_phone||'')+'</td><td style="font-size:9px">'+esc(s.blood_group||'')+'</td></tr>'}return'<div class="card"><div class="ch">All Students ('+students.length+')</div><div class="cb"><input style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:10px" placeholder="Search by name, class, or ID..." oninput="filterTbl(this.value)"><div class="tw"><table class="dt" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Section</th><th>DOB</th><th>House</th><th>Phone</th><th>Blood</th></tr>'+rows+'</table></div></div></div>'}
window.filterTbl=function(q){var r=document.querySelectorAll('#stbl tr');for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'}

loadDB();setTimeout(function(){getOCR().catch(function(){})},1500);
})();
