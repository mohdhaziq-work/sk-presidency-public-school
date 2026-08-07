/**
 * SKPPS Management Panel v5 — Google Labs Design
 * Full Firebase CRUD | Trained OCR | Sidebar Nav | Mobile Responsive
 */
(function(){
// ===== AUTH GUARD =====
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){
  location.href='../staff-login.html';return
}
document.getElementById('un').textContent=' — '+(sessionStorage.getItem('skpps_name')||'Admin');

// ===== FIREBASE ENGINE =====
window.FIREBASE_CONFIG={};var s=localStorage.getItem("skpps_firebase_config");if(s)try{FIREBASE_CONFIG=JSON.parse(s)}catch(e){}
var _f=null,_p=null,_a=null;
window._fbReady=function(){if(_p)return _p;_p=new Promise(function(ok){
  if(_f&&_f.db&&_a&&_a.currentUser)return ok(_f);
  if(!FIREBASE_CONFIG.apiKey){ok(null);return}
  function ld(u){return new Promise(function(y,n){
    if(document.querySelector('script[src="'+u+'"]'))return y();
    var s=document.createElement('script');s.src=u;s.onload=y;s.onerror=n;document.head.appendChild(s)
  })}
  var done=false,to=setTimeout(function(){if(!done){done=true;ok(null)}},15000);
  Promise.all([
    ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js'),
    ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'),
    ld('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js')
  ]).then(function(){
    if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
    _a=firebase.auth();var db=firebase.firestore();
    function fin(){if(done)return;done=true;clearTimeout(to);
      _f={db:db,auth:_a};
      try{db.enablePersistence({synchronizeTabs:true}).catch(function(){})}catch(e){}
      ok(_f)
    }
    var unsub=_a.onAuthStateChanged(function(user){unsub();
      if(user)fin();else _a.signInAnonymously().then(fin).catch(function(){fin()})
    })
  }).catch(function(e){if(!done){done=true;clearTimeout(to);ok(null)}})
});return _p};

// Firebase CRUD
window.fbGS=async function(){var f=await _fbReady();if(!f)return[];
  var s=await f.db.collection('students').where('is_active','==',true).get();
  return s.docs.map(function(d){var r=d.data();r.student_id=d.id;return r})};
window.fbAS=async function(d){var f=await _fbReady();if(!f)throw new Error("Firebase not connected");
  return f.db.collection('students').doc(d.student_id).set(d)};
window.fbGT=async function(){var f=await _fbReady();if(!f)return[];
  var s=await f.db.collection('teachers').where('is_active','==',true).get();
  return s.docs.map(function(d){var r=d.data();return r})};
window.fbAT=async function(d){var f=await _fbReady();if(!f)throw new Error("Firebase not connected");
  return f.db.collection('teachers').doc(d.username).set(d)};

// ===== STATE =====
var S=[],T=[],curTab='db',camStream=null,ocrWorker=null;
window.lg=function(){sessionStorage.clear();location.href='../staff-login.html'};
window.navTo=function(t){curTab=t;closeCamera();render();closeSidebar()};
window.closeSidebar=function(){document.getElementById('sidebar').classList.remove('open');document.getElementById('backdrop').classList.remove('show')};

// Mobile menu
document.getElementById('menuBtn').addEventListener('click',function(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('backdrop').classList.toggle('show')
});

// ===== INIT =====
async function init(){
  renderLoading();
  S=[];T=[];
  try{S=await fbGS();if(!S)S=[]}catch(e){console.error(e)}
  try{T=await fbGT();if(!T)T=[]}catch(e){console.error(e)}
  var fb=await _fbReady();
  if(!fb){document.getElementById('mainContent').innerHTML=
    '<div class="crd"><div class="crd-h" style="color:#DC2626">Firebase Not Connected</div><div class="crd-b">'+
    '<p style="font-size:13px;color:var(--g600)">Run <a href="../firebase-setup.html" style="font-weight:700;color:#DC2626">Firebase Setup</a> first.</p></div></div>';return}
  render()
}
function renderLoading(){document.getElementById('mainContent').innerHTML=
  '<div class="loading"><div class="spinner"></div><p>Connecting to Firestore...</p></div>'}

// ===== RENDER =====
function render(){
  document.querySelectorAll('.snav button').forEach(function(b){b.classList.remove('active')});
  var sel=document.querySelector('.si-'+({'scan':'sc','import':'im','teachers':'tc','students':'st','db':'db'}[curTab]));
  if(sel)sel.classList.add('active');

  var h='';
  switch(curTab){
    case 'db':h=renderDashboard();break;
    case 'scan':h=renderScanner();break;
    case 'import':h=renderImport();break;
    case 'teachers':h=renderTeachers();break;
    case 'students':h=renderStudents();break;
  }
  document.getElementById('mainContent').innerHTML=h;
}

// ===== DASHBOARD =====
function renderDashboard(){
  var classes=S.length?new Set(S.map(function(s){return s.class||s.cls})).size:0;
  return '<div class="panel active">'+
    '<div class="stats-row">'+
      statCard('st-blue','Students',S.length,'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></svg>')+
      statCard('st-green','Teachers',T.length,'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>')+
      statCard('st-red','Classes',classes,'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>')+
      statCard('st-yellow','Active',S.filter(function(s){return s.is_active!==false}).length,'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>')+
    '</div>'+
    '<div class="quick-acts">'+
      '<button class="qact qa-red" onclick="navTo(\'scan\')"><span class="qa-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span><span class="qa-info"><span class="qa-t">Scan ID Card</span><span class="qa-s">OCR auto-fill student data</span></span></button>'+
      '<button class="qact qa-blue" onclick="navTo(\'import\')"><span class="qa-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></span><span class="qa-info"><span class="qa-t">Bulk Import</span><span class="qa-s">CSV upload multiple students</span></span></button>'+
      '<button class="qact qa-green" onclick="navTo(\'teachers\')"><span class="qa-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><span class="qa-info"><span class="qa-t">Manage Teachers</span><span class="qa-s">Add teacher accounts</span></span></button>'+
      '<button class="qact qa-yellow" onclick="navTo(\'students\')"><span class="qa-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></span><span class="qa-info"><span class="qa-t">View Students</span><span class="qa-s">'+S.length+' students enrolled</span></span></button>'+
    '</div>'+
    '<div class="crd"><div class="crd-h"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--p)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>System Status</div><div class="crd-b"><div class="st-grid">'+
      '<div class="st-box"><div class="stb-lbl">Firebase</div><div class="stb-val" id="fbStat" style="color:var(--g)">Connected</div><div style="font-size:10px;color:var(--g500);margin-top:2px;font-family:monospace">'+FIREBASE_CONFIG.projectId+'</div></div>'+
      '<div class="st-box"><div class="stb-lbl">Firestore Rules</div><div class="stb-val" style="color:var(--g)">Active</div><div style="font-size:10px;color:var(--g500);margin-top:2px">READ: open | WRITE: auth</div></div>'+
    '</div></div></div>'+
  '</div>';
}

function statCard(cls,lbl,val,icon){
  return '<div class="stat-card '+cls+'"><div class="st-ic">'+icon+'</div><div class="st-n">'+val+'</div><div class="st-l">'+lbl+'</div></div>';
}

// ===== SCANNER =====
async function loadOCR(){if(!ocrWorker)ocrWorker=await Tesseract.createWorker('eng');return ocrWorker}

function renderScanner(){
  return '<div class="panel active">'+
    '<div class="scan-cards">'+
      '<div class="sc" onclick="document.getElementById(\'fileInput\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><h3>Upload Photo</h3><p>Select ID card from gallery</p><input type="file" id="fileInput" accept="image/*" onchange="handleFile(event)"></div>'+
      '<div class="sc" onclick="openCamera()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><h3>Take Photo</h3><p>Use camera to capture</p></div>'+
    '</div>'+
    '<div id="scanProgress"></div>'+
    '<div class="ocr-raw" id="ocrRaw"></div>'+
    '<div id="scanResult"></div>'+
  '</div>';
}

window.handleFile=function(e){var f=e.target.files[0];if(f){showProgress();processImage(f);e.target.value=''}};
function showProgress(){
  document.getElementById('scanProgress').innerHTML='<div class="crd" style="text-align:center;padding:20px;margin-bottom:10px"><p style="font-size:12px;color:var(--g600);margin-bottom:10px">Scanning ID Card...</p><div class="prog"><div class="pf" id="bar" style="width:0%"></div></div><p style="font-size:10px;color:var(--g500);margin-top:6px" id="barText">Loading OCR...</p></div>';
  document.getElementById('scanResult').innerHTML='';document.getElementById('ocrRaw').style.display='none'
}

function setProgress(v,m){var b=document.getElementById('bar'),t=document.getElementById('barText');if(b)b.style.width=v+'%';if(t)t.textContent=m||''}

async function processImage(file){
  try{
    var img=await new Promise(function(ok,fail){
      var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){ok(i)};i.onerror=fail;i.src=r.result};r.onerror=fail;r.readAsDataURL(file)
    });
    setProgress(15,'OCR engine ready');
    var w=await loadOCR();
    setProgress(30,'Reading ID card...');
    var res=await w.recognize(img);
    setProgress(100,'Complete');
    document.getElementById('ocrRaw').textContent='OCR OUTPUT:\n'+res.data.text;
    document.getElementById('ocrRaw').style.display='block';
    showForm(parseIDCard(res.data.text),res.data.text);
  }catch(e){showError(e.message||'Scan failed');setTimeout(function(){document.getElementById('scanProgress').innerHTML=''},400)}
}

// ===== TRAINED OCR PARSER =====
function parseIDCard(raw){
  var txt=raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n').replace(/[^a-zA-Z0-9\s\n\/\-.:@()#&|_-]/g,' ').replace(/ +/g,' ').trim();
  var lines=txt.split('\n').map(function(l){return l.trim()}).filter(Boolean);
  var f={name:'',className:'',section:'',studentID:'',father:'',phone:'',dob:''};

  function skip(l){var lo=l.toLowerCase();
    return lo.includes('presidency')||lo.includes('public school')||lo.includes('sultanpur')||
           lo.includes('uttar pradesh')||lo.includes('cbse')||lo.includes('id card')||
           lo.includes('session')||lo.includes('address')||lo==='skpps'||lo==='sk'||l.length<2}

  // ALL CAPS NAME (2-4 words)
  for(var i=0;i<lines.length;i++){if(skip(lines[i]))continue;
    var cl=lines[i].replace(/[|_~`]/g,' ').replace(/ +/g,' ').trim();
    if(cl.match(/^[A-Z]{2,}(\s+[A-Z]{2,}){1,3}$/)){f.name=cl;break}}

  // CLASS-SECTION: 10th-_-C
  for(var i=0;i<lines.length;i++){if(skip(lines[i]))continue;
    var cm=lines[i].match(/(\d{1,2}(?:st|nd|rd|th)?)[\s_-]*[-_][\s_-]*([A-C])/i);
    if(cm){f.className=cm[1].toUpperCase();f.section=cm[2].toUpperCase();break}}

  // SR NO
  for(var i=0;i<lines.length;i++){
    if(lines[i].match(/^SR\s*No/i)||lines[i].match(/^SRNo/i)){
      var sm=lines[i].match(/(\d{2,4}\/\d{4})/);if(sm)f.studentID='SKPPS'+sm[1].replace('/','');break}}

  // FATHER: F.Name / F Name / Father
  for(var i=0;i<lines.length;i++){
    if(lines[i].match(/^F\.?\s*Name/i)||lines[i].match(/^Father/i)){
      var v=lines[i].replace(/^F\.?\s*Name\s*[:=\s]+/i,'').replace(/^Father\s*(Name)?\s*[:=\s]+/i,'').replace(/[|\\]/g,'').trim();
      if(v.length>2)f.father=v;break}}

  // DOB
  for(var i=0;i<lines.length;i++){if(lines[i].match(/^DOB/i)){
    var dm=lines[i].match(/(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/);
    if(dm){var p=dm[1].split(/[-\/.]/);if(p[2].length===2)p[2]='20'+p[2];f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')};break}}

  // MOBILE
  for(var i=0;i<lines.length;i++){if(lines[i].match(/^Mob/i)||lines[i].match(/^Mobile/i)||lines[i].match(/^Phone/i)){
    var pm=lines[i].match(/(\d{10})/);if(pm)f.phone=pm[1];break}}

  // Fallbacks
  if(!f.name){for(var i=0;i<lines.length;i++){if(skip(lines[i]))continue;
    var cl=lines[i].replace(/[|_~`]/g,' ').replace(/ +/g,' ').trim();
    if(cl.match(/^[A-Z]{2,}(\s+[A-Z]{2,}){1,3}$/)){f.name=cl;break}}}
  if(!f.phone){var pm2=txt.replace(/\s/g,'').match(/(\d{10})/);if(pm2)f.phone=pm2[1]}
  if(!f.dob){var dm2=txt.match(/(\d{2}[-\/.]\d{2}[-\/.]\d{4})/);if(dm2){var p=dm2[1].split(/[-\/.]/);f.dob=p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')}}

  f.name=titleCase(f.name);f.father=titleCase(f.father);
  return f;
}

function titleCase(s){
  if(!s)return'';
  if(s===s.toUpperCase())return s.replace(/\b[a-z]/gi,function(c,i){return i===0||s[i-1]===' '?c.toUpperCase():c.toLowerCase()});
  return s.replace(/\b\w/g,function(c){return c.toUpperCase()})
}

// ===== SHOW SCAN FORM =====
function showForm(d,raw){
  var sid=d.studentID||('SKPPS'+new Date().getFullYear()+String(Date.now()%10000).padStart(4,'0'));
  var h='<div class="crd" style="border:2px solid #4ade80;margin-bottom:10px"><div class="crd-h" style="color:#059669"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>ID Card Scanned — Auto-filled</div><div class="crd-b">'+
    '<form onsubmit="return saveStudent(event)"><input type="hidden" name="sid" value="'+esc(d.yes?d.studentID:sid)+'">'+
    '<div class="form-grid"><div class="fg"><label>Student ID</label><input name="stid" value="'+esc(sid)+'" style="background:#f0fdf4;color:#065f46" readonly></div>'+
    '<div class="fg"><label>Full Name *</label><input name="name" value="'+esc(d.name)+'" '+(d.name?'style="background:#f0fdf4"':'')+' required></div></div>'+
    '<div class="form-grid"><div class="fg"><label>Class *</label><input name="cls" value="'+esc(d.className)+'" '+(d.className?'style="background:#f0fdf4"':'')+' required></div>'+
    '<div class="fg"><label>Section</label><select name="sec"><option '+(d.section==='A'?'selected':'')+'>A</option><option '+(d.section==='B'?'selected':'')+'>B</option><option '+(d.section==='C'?'selected':'')+'>C</option></select></div></div>'+
    '<div class="form-grid"><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+esc(d.dob)+'" '+(d.dob?'style="background:#f0fdf4"':'')+'></div>'+
    '<div class="fg"><label>Father Name</label><input name="father" value="'+esc(d.father)+'" '+(d.father?'style="background:#f0fdf4"':'')+'></div></div>'+
    '<div class="form-grid"><div class="fg"><label>Parent Phone</label><input name="phone" value="'+esc(d.phone)+'" type="tel" '+(d.phone?'style="background:#f0fdf4"':'')+'></div>'+
    '<div class="fg"><label>Gender</label><select name="gender"><option>Male</option><option>Female</option></select></div></div>'+
    '<div class="form-grid"><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div>'+
    '<div class="fg"><label>Blood Group</label><input name="blood" placeholder="Optional"></div></div>'+
    '<div style="display:flex;gap:10px;margin-top:12px"><button type="submit" class="btn btn-green">Save to Firestore</button>'+
    '<button type="button" class="btn btn-outline" onclick="clearScan()">Cancel</button></div></form></div></div>';
  document.getElementById('scanResult').innerHTML=h;
}

function showError(m){document.getElementById('scanResult').innerHTML='<div class="crd"><div class="crd-h" style="color:#DC2626">Scan Failed</div><div class="crd-b"><p style="font-size:12px;color:#DC2626">'+m+'</p><button onclick="clearScan()" class="btn btn-outline btn-sm" style="margin-top:8px">Try Again</button></div></div>'}
window.clearScan=function(){document.getElementById('scanResult').innerHTML='';document.getElementById('scanProgress').innerHTML='';document.getElementById('ocrRaw').style.display='none'}

// ===== SAVE STUDENT =====
window.saveStudent=async function(e){
  e.preventDefault();var f=e.target;
  var sid=f.stid.value,nm=f.name.value,cls=f.cls.value,sec=f.sec.value,dob=f.dob.value||'2000-01-01',
      father=f.father.value,phone=f.phone.value,gender=f.gender.value,house=f.house.value,blood=f.blood.value.trim();
  if(!nm||!cls){alert('Name and Class required');return false}
  document.getElementById('scanResult').innerHTML='<div class="crd" style="text-align:center;padding:20px"><div class="spinner" style="margin:0 auto 10px"></div><p style="font-size:12px;color:var(--g600)">Saving...</p></div>';
  try{
    await fbAS({student_id:sid,full_name:nm,class:cls,section:sec,date_of_birth:dob,father_name:father,
      parent_phone:phone,gender:gender,house:house,blood_group:blood||'',is_active:true,
      password:dob.replace(/-/g,'').substring(0,8)});
    document.getElementById('scanResult').innerHTML='<div class="crd" style="border:2px solid #059669"><div class="crd-h" style="color:#059669">Saved Successfully</div><div class="crd-b"><p style="font-size:13px"><strong>'+esc(nm)+'</strong> — '+esc(cls)+'-'+esc(sec)+'</p><p style="font-size:10px;color:var(--g600);margin-top:4px">ID: '+esc(sid)+' | Password: DOB</p><button onclick="clearScan()" class="btn btn-green btn-sm" style="margin-top:10px">Scan Another</button></div></div>';
    setTimeout(async function(){try{var ns=await fbGS();if(ns&&ns.length>0)S=ns}catch(e){}},400);
  }catch(e){alert('Save failed: '+e.message);document.getElementById('scanResult').innerHTML='<div class="al al-err">'+e.message+'</div>'}
  return false
};

// ===== CAMERA =====
window.openCamera=function(){
  document.getElementById('camModal').classList.add('open');
  var v=document.getElementById('camVideo');
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920}}})
    .then(function(s){camStream=s;v.srcObject=s}).catch(function(){alert('Camera unavailable');closeCamera()})
};
window.closeCamera=function(){document.getElementById('camModal').classList.remove('open');
  if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null}};
window.capturePhoto=function(){
  var v=document.getElementById('camVideo');if(!v||v.readyState<2)return;
  var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0);closeCamera();
  c.toBlob(function(b){showProgress();processImage(b)},'image/jpeg',0.85)
};

// ===== BULK IMPORT =====
function renderImport(){
  return '<div class="panel active"><div class="crd"><div class="crd-h">Bulk Import (CSV)</div><div class="crd-b">'+
    '<p style="font-size:11px;color:var(--g600);margin-bottom:10px">Format: ID, Name, Class, Section, DOB, Father, Phone, Gender, House</p>'+
    '<textarea id="csvData" style="width:100%;height:160px;border:1.5px solid var(--g300);border-radius:var(--rx);padding:10px;font-family:monospace;font-size:11px" placeholder="SKPPS14372025,Mohammad Haziq,10TH,C,2011-04-25,Sheikh Mohammad Taqwaha,8009870611,Male,Earth"></textarea>'+
    '<button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="doImport()">Import to Firestore</button>'+
    '<div id="importMsg" style="margin-top:8px;font-size:11px"></div></div></div></div>'
}
window.doImport=async function(){
  var t=document.getElementById('csvData').value.trim();if(!t)return;
  var lines=t.split('\n').filter(Boolean),a=0,s=0;
  for(var i=0;i<lines.length;i++){
    var c=lines[i].split(',').map(function(x){return x.trim()});if(c.length<4){s++;continue}
    var sid=c[0]||('SKPPS'+new Date().getFullYear()+String(a+1).padStart(3,'0')),nm=c[1],cls=c[2],sec=c[3]||'A',
        dob=c[4]||'2000-01-01',father=c[5]||'',phone=c[6]||'',gender=c[7]||'Male',house=c[8]||'Earth';
    if(!nm||!cls){s++;continue}
    try{await fbAS({student_id:sid,full_name:nm,class:cls,section:sec,date_of_birth:dob,father_name:father,
      parent_phone:phone,gender:gender,house:house,is_active:true,password:dob.replace(/-/g,'').substring(0,8)});a++}catch(e){s++}
  }
  document.getElementById('importMsg').innerHTML='<span style="color:#059669">Imported: '+a+' | Skipped: '+s+'</span>';
  var ns=await fbGS();if(ns)S=ns
};

// ===== TEACHERS =====
function renderTeachers(){
  var rows='';if(!T.length)rows='<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--g500)">No teachers added yet</td></tr>';
  else for(var i=0;i<T.length;i++){var t=T[i];rows+='<tr><td><strong>'+esc(t.full_name)+'</strong></td><td>'+esc(t.username)+'</td><td>'+esc(t.email||'-')+'</td><td><span class="badge bdg-g">Active</span></td></tr>'}
  return '<div class="panel active"><div class="crd"><div class="crd-h">Add Teacher</div><div class="crd-b">'+
    '<form onsubmit="return addTeacher(event)"><div class="form-grid"><div class="fg"><label>Full Name *</label><input id="tName" required></div>'+
    '<div class="fg"><label>Username *</label><input id="tUser" required></div></div><div class="form-grid"><div class="fg"><label>Password *</label><input type="password" id="tPass" required minlength="4"></div>'+
    '<div class="fg"><label>Email</label><input type="email" id="tEmail"></div></div><button class="btn btn-primary btn-sm">Add Teacher</button></form></div></div>'+
    '<div class="crd"><div class="crd-h">All Teachers ('+T.length+')</div><div class="crd-b"><div class="tbl-wrap"><table class="tbl"><tr><th>Name</th><th>Username</th><th>Email</th><th>Status</th></tr>'+rows+'</table></div></div></div></div>'
}
window.addTeacher=async function(e){
  e.preventDefault();var n=document.getElementById('tName').value.trim(),u=document.getElementById('tUser').value.trim(),
      p=document.getElementById('tPass').value.trim(),em=document.getElementById('tEmail').value.trim();
  try{await fbAT({username:u,password:p,full_name:n,email:em,is_active:true})}catch(er){alert('Failed: '+er.message);return false}
  T=await fbGT();render();return false
};

// ===== STUDENTS TABLE =====
function renderStudents(){
  var rows='';if(!S.length)rows='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g500)">No students in database. Use Scanner or Import to add.</td></tr>';
  else for(var i=0;i<S.length;i++){var s=S[i],hc=s.house||'Earth',
    bc=(hc==='Earth'?'bdg-g':hc==='Fire'?'bdg-r':hc==='Water'?'bdg-b':'bdg-y');
    rows+='<tr><td class="mono">'+esc(s.student_id)+'</td><td><strong>'+esc(s.full_name)+'</strong></td><td>'+esc(s.class)+'</td><td>'+esc(s.section||'-')+'</td><td style="font-size:10px">'+esc(s.date_of_birth||'-')+'</td><td><span class="badge '+bc+'">'+hc+'</span></td><td>'+esc(s.parent_phone||'-')+'</td></tr>'}
  return '<div class="panel active"><div class="crd"><div class="crd-h">Students Directory ('+S.length+')</div><div class="crd-b">'+
    '<input class="search-bar" placeholder="Search by name, ID, class or phone..." oninput="filterTable(this.value)">'+
    '<div class="tbl-wrap"><table class="tbl" id="studentTable"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>DOB</th><th>House</th><th>Phone</th></tr>'+rows+'</table></div></div></div></div>'
}
window.filterTable=function(q){
  var r=document.querySelectorAll('#studentTable tr');
  for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'
};

// ===== UTILS =====
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// ===== START =====
init();
window.addEventListener('load',function(){loadOCR().catch(function(){})});
})();
