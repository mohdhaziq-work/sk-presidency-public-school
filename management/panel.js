/* ============================================================
   SKPPS Management Panel v4
   Upload-or-Capture scanner | Real Firebase data | No freeze
   ============================================================ */
(function(){"use strict";

if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){
  location.href='../staff-login.html';
}
document.getElementById('uname').textContent=' — '+(sessionStorage.getItem('skpps_name')||'Administrator');

/* ===== STATE ===== */
var students=[], teachers=[], curTab='scan', dbReady=false;
var camStream=null, processing=false;

/* ===== DATA: Firebase ONLY, no hardcoded ===== */
async function loadDB(){
  if(dbReady) return;
  showLoader('Connecting to Firestore...');
  try {
    if(typeof fbGetStudents==='function') students = await fbGetStudents();
    if(typeof fbGetTeachers==='function') teachers = await fbGetTeachers();
  } catch(e) { console.log('Firebase load error:', e.message); }
  if(!students.length) students = JSON.parse(localStorage.getItem('skpps_students')||'[]');
  if(!teachers.length) teachers = JSON.parse(localStorage.getItem('skpps_teachers')||'[]');
  dbReady=true;
  render();
}

function showLoader(msg){
  document.getElementById('mc').innerHTML='<div style="text-align:center;padding:80px">'+
    '<div style="width:36px;height:36px;border:3px solid #E8EAED;border-top-color:#1A73E8;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div>'+
    '<p style="color:#5F6368;font-size:14px">'+msg+'</p></div>';
}

function saveLocal(){
  localStorage.setItem('skpps_students',JSON.stringify(students));
  localStorage.setItem('skpps_teachers',JSON.stringify(teachers));
}

/* ===== NAVIGATION ===== */
window.logout=function(){sessionStorage.clear();location.href='../staff-login.html'};
window.showTab=function(t){curTab=t;stopCamera();closeCameraModal();render()};

/* ===== RENDER ===== */
function render(){
  if(!dbReady){loadDB();return}
  var h='',s=students,t=teachers;
  // Stats - REAL data only
  h+='<div class="stats">'+
    '<div class="stat"><div class="v">'+s.length+'</div><div class="l">Students in Firestore</div></div>'+
    '<div class="stat"><div class="v">'+t.length+'</div><div class="l">Teachers</div></div>'+
    '<div class="stat"><div class="v">'+(s.length?new Set(s.map(function(x){return x.class||x.cls})).size:0)+'</div><div class="l">Active Classes</div></div>'+
  '</div>';
  // Tabs
  h+='<div class="tab-bar">'+
    tabBtn('scan','ID Scanner')+tabBtn('bulk','Bulk Import')+
    tabBtn('teacher','Teachers')+tabBtn('all','All Students')+
  '</div>';
  if(curTab==='scan')h+=renderScanner();
  else if(curTab==='bulk')h+=renderBulk();
  else if(curTab==='teacher')h+=renderTeachers();
  else h+=renderAll();
  document.getElementById('mc').innerHTML=h;
}
function tabBtn(id,label){
  return '<button class="'+(curTab===id?'active':'')+'" onclick="showTab(\''+id+'\')">'+label+'</button>';
}

/* ============================================================
   SCANNER - UPLOAD or TAKE PHOTO (no auto camera)
   ============================================================ */
function renderScanner(){
  return '<div class="scan-actions">'+
    // OPTION 1: Upload Photo
    '<div class="scan-card-option" onclick="document.getElementById(\'fileUpload\').click()">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'+
      '<h3>Upload Photo</h3><p>Select an ID card photo from your device</p>'+
      '<input type="file" id="fileUpload" accept="image/*" onchange="handleFileUpload(event)">'+
    '</div>'+
    // OPTION 2: Take Photo
    '<div class="scan-card-option" onclick="openCamera()">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'+
      '<h3>Take Photo</h3><p>Use your camera to capture the ID card</p>'+
    '</div>'+
  '</div>'+
  // Processing area (hidden initially)
  '<div id="processArea"></div>'+
  // Result area
  '<div id="resultArea"></div>';
}

/* ===== FILE UPLOAD ===== */
window.handleFileUpload=function(e){
  var file=e.target.files[0];if(!file)return;
  showProcessing('Processing uploaded image...');
  processImageFile(file);
  e.target.value='';
};

function showProcessing(msg){
  document.getElementById('processArea').innerHTML=
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;padding:20px;text-align:center;margin-bottom:14px;animation:fadeIn .3s">'+
    '<p style="font-size:13px;color:#5F6368;margin-bottom:12px">'+msg+'</p>'+
    '<div class="progress-wrap"><div class="progress-fill" id="ocrProgress" style="width:0%"></div></div>'+
    '<p style="font-size:11px;color:#9AA0A6;margin-top:8px" id="ocrStatus">Initializing...</p>'+
    '</div>';
  document.getElementById('resultArea').innerHTML='';
}

function updateProgress(pct,status){
  var bar=document.getElementById('ocrProgress');if(bar)bar.style.width=pct+'%';
  var txt=document.getElementById('ocrStatus');if(txt)txt.textContent=status||'';
}

/* ===== PROCESS IMAGE ===== */
async function processImageFile(file){
  processing=true;
  try{
    var img=await loadImage(file);
    var result=await runOCR(img);
    var parsed=parseCardText(result.text);
    showScanResult(parsed,result.text);
  }catch(e){
    showScanError('Failed to read image. Please try again.');
    console.error(e);
  }
  processing=false;
  document.getElementById('processArea').innerHTML='';
}

function loadImage(file){
  return new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(){var img=new Image();img.onload=function(){resolve(img)};img.onerror=reject;img.src=reader.result};
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

async function runOCR(image){
  updateProgress(5,'Loading OCR engine...');
  var worker=await Tesseract.createWorker('eng');
  updateProgress(15,'Processing image...');
  var result=await worker.recognize(image,{
    logger:function(m){
      if(m.status==='recognizing text'){
        var pct=15+Math.round(m.progress*80);
        updateProgress(pct,'Reading text: '+Math.round(m.progress*100)+'%');
      }else if(m.status==='loading tesseract core'){
        updateProgress(8,'Loading Tesseract core...');
      }
    }
  });
  await worker.terminate();
  updateProgress(100,'Done!');
  return result.data;
}

/* ===== CAMERA MODAL ===== */
window.openCamera=function(){
  var modal=document.getElementById('cameraModal');
  modal.style.display='flex';
  modal.innerHTML=
    '<div class="camera-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px">'+
      '<div class="cam-frame">'+
        '<video id="modalCam" autoplay playsinline style="border-radius:14px;max-height:65vh;max-width:85vw;box-shadow:0 8px 40px rgba(0,0,0,0.5)"></video>'+
        '<div style="position:absolute;inset:8% 10%;border:2px dashed rgba(255,255,255,0.5);border-radius:14px;pointer-events:none"></div>'+
      '</div>'+
      '<div style="margin-top:20px;display:flex;gap:12px">'+
        '<button onclick="captureFromCamera()" style="padding:14px 32px;background:#1A73E8;color:white;border:none;border-radius:28px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px">'+
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/></svg>Capture'+
        '</button>'+
        '<button onclick="closeCameraModal()" style="padding:14px 28px;background:rgba(255,255,255,0.1);color:white;border:1.5px solid rgba(255,255,255,0.3);border-radius:28px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Cancel</button>'+
      '</div>'+
    '</div>';
  startModalCamera();
};

function startModalCamera(){
  var v=document.getElementById('modalCam');if(!v)return;
  navigator.mediaDevices.getUserMedia({
    video:{facingMode:'environment',width:{ideal:1920},height:{ideal:1440}}
  }).then(function(s){camStream=s;v.srcObject=s}).catch(function(){
    alert('Camera not available. Please use Upload Photo instead.');
    closeCameraModal();
  });
}

window.closeCameraModal=function(){
  stopCamera();
  document.getElementById('cameraModal').style.display='none';
  document.getElementById('cameraModal').innerHTML='';
};

function stopCamera(){
  if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null}
}

window.captureFromCamera=function(){
  var v=document.getElementById('modalCam');if(!v||v.readyState<2)return;
  var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0,c.width,c.height);
  closeCameraModal();
  // Convert to blob for efficient processing
  c.toBlob(function(blob){
    showProcessing('Processing captured photo...');
    processImageFile(blob);
  },'image/jpeg',0.85);
};

/* ===== SMART PARSER ===== */
function parseCardText(text){
  var clean=text.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@]/g,' ').replace(/\s+/g,' ').trim();
  var words=clean.split(/\s+/).filter(function(w){return w.length>1});
  var lines=clean.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  var f={name:'',cls:'',sec:'',roll:'',sid:'',father:'',phone:'',dob:'',blood:''};

  // Name: two consecutive capitalized words
  for(var i=0;i<words.length-1;i++){
    if(!f.name&&/^[A-Z][a-z]{2,}$/.test(words[i])&&/^[A-Z][a-z]{2,}$/.test(words[i+1])){
      if(!/^(Class|Roll|Father|Mother|Blood|Phone|House|Student|Admission|Date|DOB|Name)$/i.test(words[i])){
        f.name=words[i]+' '+words[i+1];
      }
    }
  }

  for(var i=0;i<lines.length;i++){
    var l=lines[i],lo=l.toLowerCase();
    if(!f.cls&&l.match(/^(Nursery|LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i))f.cls=l.toUpperCase();
    else if(!f.cls&&lo.includes('class'))f.cls=l.replace(/class[:.\s-]*/i,'').trim().toUpperCase();
    if(!f.roll&&lo.includes('roll'))f.roll=l.replace(/^(roll|rno|roll no)[:.\s-]*/i,'').trim();
    else if(!f.roll&&l.match(/^\d{1,3}$/)&&parseInt(l)>0&&parseInt(l)<=100)f.roll=l;
    if(!f.sid&&(lo.includes('student id')||lo.includes('admission')))f.sid=l.replace(/^(student id|admission no|admission|adm no|id)[:.\s-]*/i,'').trim();
    else if(!f.sid&&l.match(/^SKPPS/i))f.sid=l;
    if(!f.father&&lo.includes('father'))f.father=l.replace(/^(father|father name|father\'s name)[:.\s-]*/i,'').trim();
    if(!f.phone&&l.replace(/\D/g,'').match(/^\d{10}$/))f.phone=l.replace(/\D/g,'');
    if(!f.dob&&(lo.includes('dob')||lo.includes('birth')||lo.includes('date of birth')))f.dob=l.replace(/^(dob|birth|date of birth|d\.o\.b)[:.\s-]*/i,'').trim();
    else if(!f.dob&&l.match(/^\d{2}[\/-]\d{2}[\/-]\d{4}$/))f.dob=l;
    if(!f.blood&&l.match(/^(A|B|AB|O)[+-]$/i))f.blood=l.toUpperCase();
  }
  if(!f.sec){for(var i=0;i<lines.length;i++){var m=lines[i].match(/\b([A-C])\b/);if(m&&!f.sec){f.sec=m[1];break}}}
  return f;
}

/* ===== SHOW RESULT ===== */
function showScanResult(data,rawText){
  var sid=data.sid||('SKPPS'+Date.now().toString(36).toUpperCase());
  document.getElementById('resultArea').innerHTML=
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:2px solid #4ade80;overflow:hidden;animation:fadeIn .3s">'+
    '<div class="ch" style="color:#059669">ID Card Detected</div>'+
    '<div class="cb">'+
      '<details style="margin-bottom:12px"><summary style="font-size:11px;color:#9AA0A6;cursor:pointer">View raw OCR output</summary>'+
        '<pre style="font-size:10px;background:#F8F9FA;padding:8px;border-radius:6px;max-height:80px;overflow:auto;margin-top:6px;font-family:monospace;white-space:pre-wrap;word-break:break-all">'+esc(rawText)+'</pre></details>'+
      '<form id="scanForm" onsubmit="return saveStudent(event)">'+
        '<input type="hidden" name="sid" value="'+sid+'">'+
        '<div class="r2"><div class="fg"><label>Student ID</label><input name="stid" value="'+esc(sid)+'"></div><div class="fg"><label>Full Name *</label><input name="name" value="'+esc(data.name)+'" required autofocus></div></div>'+
        '<div class="r3"><div class="fg"><label>Class *</label><input name="cls" value="'+esc(data.cls)+'" required></div><div class="fg"><label>Section</label><select name="sec"><option '+(data.sec==='A'?'selected':'')+'>A</option><option '+(data.sec==='B'?'selected':'')+'>B</option><option '+(data.sec==='C'?'selected':'')+'>C</option></select></div><div class="fg"><label>Roll No</label><input name="roll" value="'+esc(data.roll)+'"></div></div>'+
        '<div class="r2"><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+esc(data.dob)+'"></div><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div></div>'+
        '<div class="r2"><div class="fg"><label>Father Name</label><input name="father" value="'+esc(data.father)+'"></div><div class="fg"><label>Blood Group</label><input name="blood" value="'+esc(data.blood)+'"></div></div>'+
        '<div class="fg"><label>Parent Phone</label><input name="phone" value="'+esc(data.phone)+'" type="tel"></div>'+
        '<div style="display:flex;gap:10px;margin-top:12px">'+
          '<button type="submit" class="btn btn-g btn-block">Save to Firestore</button>'+
          '<button type="button" class="btn btn-o" onclick="resetResult()">Cancel</button>'+
        '</div>'+
      '</form>'+
    '</div></div>';
}

function showScanError(msg){
  document.getElementById('resultArea').innerHTML=
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden;animation:fadeIn .3s">'+
    '<div class="ch" style="color:#DC2626">Scan Failed</div>'+
    '<div class="cb"><div class="alert aerr">'+msg+'</div>'+
    '<p style="font-size:11px;color:#5F6368;margin-bottom:10px">Tips: Good lighting, hold card steady, make sure text is clear.</p>'+
    '<button onclick="resetResult()" class="btn btn-o">Try Again</button></div></div>';
}

window.resetResult=function(){
  document.getElementById('resultArea').innerHTML='';
  document.getElementById('processArea').innerHTML='';
};

function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* ===== SAVE STUDENT ===== */
window.saveStudent=async function(e){
  e.preventDefault();var f=e.target;
  var sid=f.stid.value||f.sid.value||('SKPPS'+Date.now().toString(36).toUpperCase()),name=f.name.value,
      cls=f.cls.value,sec=f.sec.value,roll=parseInt(f.roll.value)||0,dob=f.dob.value||'2000-01-01',
      father=f.father.value,phone=f.phone.value,blood=f.blood.value,house=f.house.value;
  if(!name||!cls){alert('Name and Class are required');return false}
  var st={student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,
    father_name:father,parent_phone:phone,blood_group:blood,house:house,is_active:true,
    password:dob.replace(/-/g,'').substring(0,8),added_at:new Date().toISOString()};
  students.push(st);saveLocal();
  var cloud=false;try{cloud=await fbAddStudent(st)}catch(e){}
  document.getElementById('resultArea').innerHTML=
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:2px solid #059669;overflow:hidden;animation:fadeIn .3s">'+
    '<div class="ch" style="color:#059669">Student Saved!</div>'+
    '<div class="cb"><p style="font-size:14px;line-height:1.8"><strong>'+esc(name)+'</strong> added to '+(cloud?'Firestore.':'local storage.')+'</p>'+
    '<p style="font-size:11px;color:#5F6368;margin-top:4px">ID: '+esc(sid)+' | Class: '+esc(cls)+'-'+esc(sec)+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p>'+
    '<button onclick="resetResult()" class="btn btn-o mt2">Scan Another Card</button></div></div>';
  return false;
};

/* ===== BULK IMPORT ===== */
function renderBulk(){
  return '<div class="card"><div class="ch">Bulk Import (CSV)</div><div class="cb">'+
    '<p style="font-size:12px;color:#5F6368;margin-bottom:10px">Paste CSV from school software. Format: ID,Name,Class,Section,Roll,DOB,Father,Mother,Phone,Gender,House</p>'+
    '<textarea id="csvData" style="width:100%;height:160px;border:1.5px solid #DADCE0;border-radius:8px;padding:10px;font-family:monospace;font-size:10px" placeholder="SKPPS2024001,John Smith,V,A,8,2017-05-10,Robert,Mary,9876543210,Male,Earth"></textarea>'+
    '<button class="btn btn-b mt1" onclick="runImport()" id="btnImport">Import to Database</button>'+
    '<div id="csvMsg" class="mt1"></div></div></div>';
}

window.runImport=async function(){
  var t=document.getElementById('csvData').value.trim();if(!t)return;
  var btn=document.getElementById('btnImport');btn.disabled=true;btn.textContent='Importing...';
  var lines=t.split('\n').filter(Boolean),added=0,skipped=0,cloud=0;
  for(var i=0;i<lines.length;i++){
    var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<6){skipped++;continue}
    var sid=c[0]||('SKPPS'+Date.now().toString(36).toUpperCase()),name=c[1],cls=c[2],sec=c[3]||'A',
        roll=parseInt(c[4])||0,dob=c[5]||'2000-01-01',father=c[6]||'',mother=c[7]||'',
        phone=c[8]||'',gender=c[9]||'Male',house=c[10]||'Earth';
    if(!name||!cls){skipped++;continue}
    students.push({student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,
      father_name:father,mother_name:mother,parent_phone:phone,gender:gender,house:house,is_active:true,
      password:dob.replace(/-/g,'').substring(0,8),added_at:new Date().toISOString()});added++;
    try{if(await fbAddStudent(students[students.length-1]))cloud++}catch(e){}
  }
  saveLocal();btn.disabled=false;btn.textContent='Import to Database';
  document.getElementById('csvMsg').innerHTML='<div class="alert aok">Imported: '+added+' students ('+cloud+' to Firestore). Skipped: '+skipped+' invalid.</div>';
  loadDB();
};

/* ===== TEACHERS ===== */
function renderTeachers(){
  var rows='';
  if(!teachers.length)rows='<tr><td colspan="3" style="text-align:center;padding:24px;color:#9AA0A6">No teachers added yet</td></tr>';
  else for(var i=0;i<teachers.length;i++){var tch=teachers[i];rows+='<tr><td><strong>'+esc(tch.full_name)+'</strong></td><td>'+esc(tch.username)+'</td><td><span class="badge-sm bg">Active</span></td></tr>'}
  return '<div class="card"><div class="ch">Teacher Accounts</div><div class="cb">'+
    '<form onsubmit="return addTeacher(event)"><div class="r2"><div class="fg"><label>Full Name</label><input id="tn" required></div><div class="fg"><label>Username</label><input id="tu" required></div></div>'+
    '<div class="r2"><div class="fg"><label>Password</label><input type="password" id="tpw" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te"></div></div>'+
    '<button type="submit" class="btn btn-b mt1">Add Teacher</button></form>'+
    '<div class="tw"><table class="dt"><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>';
}
window.addTeacher=async function(e){e.preventDefault();var n=document.getElementById('tn').value.trim(),u=document.getElementById('tu').value.trim(),p=document.getElementById('tpw').value.trim(),em=document.getElementById('te').value.trim();teachers.push({username:u,password:p,full_name:n,email:em,is_active:true});saveLocal();try{await fbAddTeacher(teachers[teachers.length-1])}catch(er){}render();return false};

/* ===== ALL STUDENTS ===== */
function renderAll(){
  var rows='';
  if(!students.length)rows='<tr><td colspan="8" style="text-align:center;padding:30px;color:#9AA0A6">No students yet. Use Scanner or Import.</td></tr>';
  else for(var i=0;i<students.length;i++){var s=students[i],hc=s.house||'Earth';rows+='<tr><td>'+esc(s.student_id)+'</td><td><strong>'+esc(s.full_name)+'</strong></td><td>'+esc(s.class)+'</td><td>'+esc(s.section)+'</td><td>'+s.roll_no+'</td><td><span class="badge-sm '+(hc==='Earth'?'bg':hc==='Fire'?'br':hc==='Water'?'bb':'by')+'">'+hc+'</span></td><td>'+esc(s.parent_phone)+'</td><td style="font-size:10px">'+esc(s.date_of_birth)+'</td></tr>'}
  return '<div class="card"><div class="ch">All Students ('+students.length+')</div><div class="cb">'+
    '<input style="width:100%;padding:9px 12px;border:1.5px solid #DADCE0;border-radius:8px;font-size:12px;font-family:var(--f);margin-bottom:12px" placeholder="Search..." oninput="filterStudents(this.value)">'+
    '<div class="tw"><table class="dt" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>Roll</th><th>House</th><th>Phone</th><th>DOB</th></tr>'+rows+'</table></div></div></div>';
}
window.filterStudents=function(q){var rows=document.querySelectorAll('#stbl tr');for(var i=1;i<rows.length;i++)rows[i].style.display=rows[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'};

/* ===== INIT ===== */
loadDB();
})();
