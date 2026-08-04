/* ============================================================
   SKPPS Management Panel v3 - Professional Smart Scanner
   Portrait mode | Capture first → OCR → Verify → Save
   Three-tier storage: Firestore → localStorage → memory
   ============================================================ */
(function(){"use strict";

if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('uname').textContent=' — '+(sessionStorage.getItem('skpps_name')||'Administrator');

var students=[],teachers=[],curTab='scan',dbReady=false;
var camStream=null,capturedBlob=null,ocrInProgress=false;

/* ===== DATA LAYER ===== */
async function loadDB(){
  if(dbReady)return;
  var s=[],t=[];
  // 1) Firebase
  if(typeof FIREBASE_CONFIG!=='undefined'&&FIREBASE_CONFIG.apiKey&&typeof fbGetStudents==='function'){
    try{s=await fbGetStudents();t=await fbGetTeachers()}catch(e){console.log('Firebase offline')}
  }
  // 2) localStorage fallback
  if(!s.length)s=JSON.parse(localStorage.getItem('skpps_students')||'[]');
  if(!t.length)t=JSON.parse(localStorage.getItem('skpps_teachers')||'[]');
  students=s;teachers=t;dbReady=true;
}
function saveLocal(){localStorage.setItem('skpps_students',JSON.stringify(students));localStorage.setItem('skpps_teachers',JSON.stringify(teachers))}
async function addStudentToCloud(st){
  if(typeof FIREBASE_CONFIG!=='undefined'&&FIREBASE_CONFIG.apiKey&&typeof fbAddStudent==='function'){
    try{await fbAddStudent(st);return true}catch(e){return false}
  }return false
}
async function addTeacherToCloud(t){
  if(typeof FIREBASE_CONFIG!=='undefined'&&FIREBASE_CONFIG.apiKey&&typeof fbAddTeacher==='function'){
    try{await fbAddTeacher(t);return true}catch(e){return false}
  }return false
}

/* ===== NAVIGATION ===== */
window.logout=function(){sessionStorage.clear();location.href='../staff-login.html'}
window.showTab=function(t){curTab=t;stopCamera();render()}

/* ===== RENDER ENGINE ===== */
function render(){
  if(!dbReady){loadDB().then(render);document.getElementById('mc').innerHTML='<div style="text-align:center;padding:80px;color:var(--g500)"><div style="width:36px;height:36px;border:3px solid var(--g200);border-top-color:var(--p);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div><p>Loading data...</p></div>';return}
  var h='';
  // Stats
  h+='<div class="stats"><div class="stat"><div class="v">'+students.length+'</div><div class="l">Students <span style="opacity:0.5">(Firestore)</span></div></div><div class="stat"><div class="v">'+teachers.length+'</div><div class="l">Teachers</div></div><div class="stat"><div class="v">'+(students.length?new Set(students.map(function(s){return s.class||s.cls})).size:0)+'</div><div class="l">Active Classes</div></div></div>';
  // Tabs
  h+='<div class="tab-bar">';
  h+=tabBtn('scan','ID Card Scanner');
  h+=tabBtn('bulk','Bulk Import');
  h+=tabBtn('teacher','Teacher Accounts');
  h+=tabBtn('all','All Students');
  h+='</div>';
  // Content
  if(curTab==='scan')h+=renderScanner();
  else if(curTab==='bulk')h+=renderBulk();
  else if(curTab==='teacher')h+=renderTeachers();
  else h+=renderAll();
  document.getElementById('mc').innerHTML=h;
  if(curTab==='scan')startCamera();
}
function tabBtn(id,label){return '<button class="'+(curTab===id?'active':'')+'" onclick="showTab(\''+id+'\')">'+label+'</button>'}

/* ============================================================
   SCANNER TAB - Portrait, Capture → OCR → Verify → Save
   ============================================================ */
function renderScanner(){
  return '<div class="scanner-layout">'+
    // LEFT COLUMN - Camera
    '<div class="cam-container">'+
      '<div class="card"><div class="ch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Live Camera</div>'+
        '<div class="cb" style="padding:0">'+
          '<div class="cam-view">'+
            '<video id="camVid" autoplay playsinline></video>'+
            '<div class="id-frame"></div>'+
            '<div class="frame-label" id="camLabel">Position ID card in frame</div>'+
            '<div class="captured-overlay" id="captureFlash"><div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg></div></div>'+
          '</div>'+
          '<div class="cam-actions">'+
            '<button class="btn btn-b btn-block btn-lg" id="btnCapture" onclick="capturePhoto()" style="flex:2">'+
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'+
              'Capture ID Card'+
            '</button>'+
            '<button class="btn btn-o" onclick="switchCamera()" title="Switch Camera" style="flex:0">'+
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>'+
            '</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    // RIGHT COLUMN - Processing & Results
    '<div class="result-panel" id="resultArea">'+
      '<div class="card"><div class="ch">Scan Result</div><div class="cb">'+
        '<div style="text-align:center;padding:40px 20px;color:var(--g500)">'+
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--g300)" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'+
          '<p style="margin-top:12px;font-size:13px">Capture an ID card to<br>automatically read student details</p>'+
        '</div>'+
      '</div></div>'+
    '</div>'+
  '</div>';
}

/* ===== CAMERA ===== */
var facingMode='environment';
function startCamera(){
  var v=document.getElementById('camVid');if(!v)return;
  stopCamera();
  navigator.mediaDevices.getUserMedia({video:{facingMode:facingMode,width:{ideal:1080},height:{ideal:1440},aspectRatio:{ideal:0.75}}}).then(function(s){
    camStream=s;v.srcObject=s;
    v.onloadedmetadata=function(){updateCamLabel('Position ID card in frame')}
  }).catch(function(e){
    var box=document.querySelector('.cam-view');
    if(box)box.innerHTML='<div style="color:white;text-align:center;padding:50px 20px"><p style="font-size:14px;margin-bottom:8px">Camera Required</p><p style="font-size:11px;opacity:0.7">Allow camera access and reload the page</p></div>';
  });
}
function stopCamera(){if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null}}
function switchCamera(){facingMode=(facingMode==='environment'?'user':'environment');stopCamera();startCamera()}
function updateCamLabel(msg){var e=document.getElementById('camLabel');if(e)e.textContent=msg}

/* ===== CAPTURE PHOTO → OCR → SHOW RESULT ===== */
window.capturePhoto=function(){
  if(ocrInProgress)return;
  var v=document.getElementById('camVid'),btn=document.getElementById('btnCapture');
  if(!v||v.readyState<2){updateCamLabel('Camera not ready');return}

  // Flash effect
  var flash=document.getElementById('captureFlash');flash.classList.add('show');
  setTimeout(function(){flash.classList.remove('show')},600);

  // Draw to canvas
  var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0,c.width,c.height);
  capturedBlob=c;

  // Update UI
  btn.innerHTML='<div class="spinner"></div> Processing...';btn.disabled=true;
  updateCamLabel('Scanning...');

  // Show processing state
  document.getElementById('resultArea').innerHTML='<div class="card"><div class="ch">Processing Scan</div><div class="cb"><div class="processing-state"><div class="spinner-big"></div><p>Reading ID card text...</p></div></div></div>';

  // Run OCR
  processCard(c);
};

async function processCard(canvas){
  ocrInProgress=true;
  try{
    var result=await Tesseract.recognize(canvas,'eng',{
      logger:function(m){
        if(m.status==='recognizing text'){
          var pct=Math.round(m.progress*100);
          var el=document.querySelector('.processing-state p');
          if(el)el.textContent='Reading text: '+pct+'%';
        }
      }
    });
    var text=result.data.text;
    var parsed=parseIDCard(text,canvas);

    // Show result
    var btn=document.getElementById('btnCapture');
    btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Capture Next Card';
    btn.disabled=false;updateCamLabel('Ready for next card');

    showScanResult(parsed,text);
  }catch(e){
    showScanError('OCR failed. Please try again with better lighting.');
    var btn=document.getElementById('btnCapture');
    btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Retry Capture';
    btn.disabled=false;
  }
  ocrInProgress=false;
}

/* ===== SMART ID CARD PARSER ===== */
function parseIDCard(text,canvas){
  var clean=text.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@]/g,' ').replace(/\s+/g,' ').trim();
  var lines=clean.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  var found={name:'',cls:'',sec:'',roll:'',sid:'',father:'',phone:'',dob:'',blood:''};

  // Word-level extraction
  var allWords=clean.split(/\s+/).filter(function(w){return w.length>1});

  // Name: Find 2+ consecutive capitalized words not matching other patterns
  for(var i=0;i<allWords.length-1;i++){
    if(!found.name&&/^[A-Z][a-z]{2,}$/.test(allWords[i])&&/^[A-Z][a-z]{2,}$/.test(allWords[i+1])){
      if(!/^(Class|Roll|Father|Mother|Blood|Phone|House|Student|Admission|Date|DOB|Name)$/i.test(allWords[i])){
        found.name=allWords[i]+' '+allWords[i+1];
      }
    }
  }

  // Line-level extraction
  for(var i=0;i<lines.length;i++){
    var l=lines[i],lo=l.toLowerCase();

    // Class
    if(!found.cls){
      var classMatch=l.match(/^(Nursery|LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i);
      if(classMatch){found.cls=classMatch[0].toUpperCase()}else if(lo.includes('class')){found.cls=l.replace(/class[:.\s-]*/i,'').trim().toUpperCase()}
    }

    // Roll number
    if(!found.roll&&lo.includes('roll'))found.roll=l.replace(/^(roll|roll no|roll number)[:.\s-]*/i,'').trim();
    else if(!found.roll&&l.match(/^\d{1,3}$/)&&parseInt(l)>0&&parseInt(l)<=100)found.roll=l;

    // Student ID
    if(!found.sid&&(lo.includes('student id')||lo.includes('admission')))found.sid=l.replace(/^(student id|admission no|admission)[:.\s-]*/i,'').trim();
    else if(!found.sid&&l.match(/^SKPPS/i))found.sid=l;

    // Father
    if(!found.father&&lo.includes('father'))found.father=l.replace(/^(father|father name|father\'s name)[:.\s-]*/i,'').trim();

    // Phone
    if(!found.phone&&l.replace(/\D/g,'').match(/^\d{10}$/))found.phone=l.replace(/\D/g,'');

    // DOB
    if(!found.dob&&(lo.includes('dob')||lo.includes('birth')||lo.includes('date of birth')))
      found.dob=l.replace(/^(dob|birth date|date of birth)[:.\s-]*/i,'').trim();
    else if(!found.dob&&l.match(/^\d{2}[\/-]\d{2}[\/-]\d{4}$/))found.dob=l;

    // Blood
    if(!found.blood&&l.match(/^(A|B|AB|O)[+-]$/i))found.blood=l.toUpperCase();
  }

  // Detect section from OCR text (A, B, C near class)
  if(!found.sec){
    for(var i=0;i<lines.length;i++){
      var m=lines[i].match(/\b([A-C])\b/);
      if(m&&!found.sec){found.sec=m[1]}
    }
  }

  return found;
}

/* ===== SHOW SCAN RESULT ===== */
function showScanResult(data,rawText){
  var sid=data.sid||('SKPPS'+Date.now().toString(36).toUpperCase());
  var h='<div class="card" style="border:2px solid #4ade80">'+
    '<div class="ch" style="color:#059669"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>ID Card Read Successfully</div>'+
    '<div class="cb">'+
      '<details style="margin-bottom:12px"><summary style="font-size:11px;color:var(--g500);cursor:pointer;padding:4px 0">View raw OCR text</summary><pre style="font-size:10px;background:var(--g50);padding:10px;border-radius:var(--rs);max-height:100px;overflow:auto;margin-top:6px;font-family:monospace">'+rawText.replace(/</g,'&lt;')+'</pre></details>'+
      '<form id="scanForm" onsubmit="return saveScanned(event)">'+
        '<input type="hidden" name="sid" value="'+sid+'">'+
        '<div class="r2"><div class="fg"><label>Student ID</label><input name="stid" value="'+sid+'"></div><div class="fg"><label>Full Name *</label><input name="name" value="'+cleanHtml(data.name)+'" required autofocus></div></div>'+
        '<div class="r3"><div class="fg"><label>Class *</label><input name="cls" value="'+cleanHtml(data.cls)+'" required></div><div class="fg"><label>Section</label><select name="sec"><option '+(data.sec==='A'?'selected':'')+'>A</option><option '+(data.sec==='B'?'selected':'')+'>B</option><option '+(data.sec==='C'?'selected':'')+'>C</option></select></div><div class="fg"><label>Roll No</label><input name="roll" value="'+cleanHtml(data.roll)+'"></div></div>'+
        '<div class="r2"><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+cleanHtml(data.dob)+'"></div><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div></div>'+
        '<div class="r2"><div class="fg"><label>Father Name</label><input name="father" value="'+cleanHtml(data.father)+'"></div><div class="fg"><label>Blood Group</label><input name="blood" value="'+cleanHtml(data.blood)+'"></div></div>'+
        '<div class="fg"><label>Parent Phone</label><input name="phone" value="'+cleanHtml(data.phone)+'" type="tel"></div>'+
        '<div style="display:flex;gap:10px;margin-top:12px">'+
          '<button type="submit" class="btn btn-g btn-block"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save to Database</button>'+
          '<button type="button" class="btn btn-o" onclick="document.getElementById(\'resultArea\').innerHTML=defaultResultHTML();updateCamLabel(\'Position ID card in frame\')">Cancel</button>'+
        '</div>'+
      '</form>'+
    '</div></div>';
  document.getElementById('resultArea').innerHTML=h;
}

function showScanError(msg){
  document.getElementById('resultArea').innerHTML='<div class="card"><div class="ch" style="color:#DC2626">Scan Failed</div><div class="cb"><div class="alert aerr">'+msg+'</div><p style="font-size:12px;color:var(--g600)">Tips: Ensure good lighting, hold card steady, fill the frame.</p><button class="btn btn-o mt1" onclick="document.getElementById(\'resultArea\').innerHTML=defaultResultHTML()">Dismiss</button></div></div>';
}

function defaultResultHTML(){
  return '<div class="card"><div class="ch">Scan Result</div><div class="cb"><div style="text-align:center;padding:40px 20px;color:var(--g500)"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--g300)" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><p style="margin-top:12px;font-size:13px">Capture an ID card to<br>automatically read student details</p></div></div></div>';
}

function cleanHtml(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

/* ===== SAVE SCANNED STUDENT ===== */
window.saveScanned=async function(e){
  e.preventDefault();var f=e.target;
  var sid=f.stid.value||f.sid.value||('SKPPS'+Date.now().toString(36).toUpperCase()),name=f.name.value,cls=f.cls.value,sec=f.sec.value,roll=parseInt(f.roll.value)||0,dob=f.dob.value||'2000-01-01',father=f.father.value,phone=f.phone.value,blood=f.blood.value,house=f.house.value;
  if(!name||!cls){alert('Name and Class are required');return false}
  var st={student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,father_name:father,parent_phone:phone,blood_group:blood,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8),added_at:new Date().toISOString()};
  students.push(st);saveLocal();
  var cloud=await addStudentToCloud(st);
  document.getElementById('resultArea').innerHTML='<div class="card" style="border:2px solid #059669"><div class="ch" style="color:#059669"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Student Saved!</div><div class="cb"><p style="font-size:14px;line-height:1.8"><strong>'+name+'</strong> added successfully'+(cloud?' to Firebase.':'.')+'</p><p style="font-size:12px;color:var(--g600);margin-top:6px">ID: '+sid+' | Class: '+cls+'-'+sec+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p><button class="btn btn-o mt2" onclick="document.getElementById(\'resultArea\').innerHTML=defaultResultHTML();updateCamLabel(\'Position ID card in frame\')">Scan Another Card</button></div></div>';
  loadDB().then(render);return false;
}

/* ===== BULK IMPORT ===== */
function renderBulk(){
  return '<div class="card"><div class="ch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Bulk Import (CSV)</div><div class="cb">'+
    '<p style="font-size:12px;color:var(--g600);margin-bottom:10px">Paste CSV data from existing school software. One line per student:</p>'+
    '<code style="display:block;background:var(--g50);padding:10px;border-radius:var(--rs);font-size:10px;margin-bottom:12px;word-break:break-all;font-family:monospace">StudentID,FullName,Class,Section,RollNo,DOB(YYYY-MM-DD),FatherName,MotherName,Phone,Gender,House</code>'+
    '<textarea id="csvData" style="width:100%;height:160px;border:1.5px solid var(--g300);border-radius:var(--rs);padding:12px;font-family:monospace;font-size:11px" placeholder="SKPPS2024001,John Smith,V,A,8,2017-05-10,Robert Smith,Mary Smith,9876543210,Male,Earth"></textarea>'+
    '<div style="display:flex;gap:10px;margin-top:10px">'+
      '<button class="btn btn-b" onclick="runImport()" id="btnImport">Import to Database</button>'+
      '<span id="importCount" style="font-size:12px;color:var(--g600);align-self:center"></span></div>'+
    '<div id="csvMsg" class="mt1"></div></div></div>';
}
window.runImport=async function(){
  var t=document.getElementById('csvData').value.trim();if(!t)return;
  var btn=document.getElementById('btnImport');btn.disabled=true;btn.textContent='Importing...';
  var lines=t.split('\n').filter(Boolean),added=0,skipped=0,cloudAdd=0;
  for(var i=0;i<lines.length;i++){
    var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<6){skipped++;continue}
    var sid=c[0]||('SKPPS'+Date.now().toString(36).toUpperCase()),name=c[1],cls=c[2],sec=c[3]||'A',roll=parseInt(c[4])||0,dob=c[5]||'2000-01-01',father=c[6]||'',mother=c[7]||'',phone=c[8]||'',gender=c[9]||'Male',house=c[10]||'Earth';
    if(!name||!cls){skipped++;continue}
    var st={student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,father_name:father,mother_name:mother,parent_phone:phone,gender:gender,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8),added_at:new Date().toISOString()};
    students.push(st);added++;
    var ok=await addStudentToCloud(st);if(ok)cloudAdd++;
  }
  saveLocal();btn.disabled=false;btn.textContent='Import to Database';
  document.getElementById('csvMsg').innerHTML='<div class="alert aok">Imported: '+added+' students ('+cloudAdd+' to cloud). Skipped: '+skipped+' invalid rows.</div>';
  loadDB().then(render);
}

/* ===== TEACHERS ===== */
function renderTeachers(){
  var rows='';if(teachers.length===0)rows='<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--g500)">No teachers added yet. Use the form below to add staff accounts.</td></tr>';
  else for(var i=0;i<teachers.length;i++){var t=teachers[i];rows+='<tr><td><strong>'+t.full_name+'</strong></td><td>'+t.username+'</td><td><span class="badge-sm bg">Active</span></td></tr>'}
  return '<div class="card"><div class="ch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Teacher Accounts</div><div class="cb">'+
    '<form onsubmit="return addTeacher(event)" style="margin-bottom:16px"><div class="r2"><div class="fg"><label>Full Name</label><input id="tn" required></div><div class="fg"><label>Username</label><input id="tu" required></div></div><div class="r2"><div class="fg"><label>Password</label><input type="password" id="tpw" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te"></div></div><button type="submit" class="btn btn-b mt1">Add Teacher</button></form>'+
    '<div class="tw"><table class="dt"><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>';
}
window.addTeacher=async function(e){e.preventDefault();var n=document.getElementById('tn').value.trim(),u=document.getElementById('tu').value.trim(),p=document.getElementById('tpw').value.trim(),em=document.getElementById('te').value.trim();var t={username:u,password:p,full_name:n,email:em,is_active:true};teachers.push(t);saveLocal();await addTeacherToCloud(t);loadDB().then(render);return false}

/* ===== ALL STUDENTS ===== */
function renderAll(){
  var rows='';if(students.length===0)rows='<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--g500)">No students in database. Use the ID Scanner or Bulk Import.</td></tr>';
  else for(var i=0;i<students.length;i++){var s=students[i],hc=s.house||'Earth';rows+='<tr><td>'+s.student_id+'</td><td><strong>'+s.full_name+'</strong></td><td>'+s.class+'</td><td>'+s.section+'</td><td>'+s.roll_no+'</td><td><span class="badge-sm '+(hc==='Earth'?'bg':hc==='Fire'?'br':hc==='Water'?'bb':'by')+'">'+hc+'</span></td><td>'+s.parent_phone+'</td><td style="font-size:10px">'+s.date_of_birth+'</td></tr>'}
  return '<div class="card"><div class="ch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>All Students ('+students.length+')</div><div class="cb">'+
    '<input style="width:100%;padding:9px 12px;border:1.5px solid var(--g300);border-radius:var(--rs);font-size:13px;font-family:var(--f);margin-bottom:12px" placeholder="Search by name, class, roll number, or ID..." oninput="filterStudents(this.value)"><div class="tw"><table class="dt" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>Roll</th><th>House</th><th>Phone</th><th>DOB</th></tr>'+rows+'</table></div></div></div>';
}
window.filterStudents=function(q){var r=document.querySelectorAll('#stbl tr');for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'}

/* ===== INIT ===== */
loadDB().then(render);
})();
