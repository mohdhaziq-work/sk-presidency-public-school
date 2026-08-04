/* ============================================================
   SKPPS Management Panel - Professional ID Scanner
   Firebase Firestore + localStorage hybrid storage
   Portrait camera → Capture → OCR → Verify → Save
   ============================================================ */
(function(){
"use strict";

/* ===== AUTH ===== */
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){
  location.href='../staff-login.html';
}
document.getElementById('uname').textContent=' — '+(sessionStorage.getItem('skpps_name')||'Administrator');

/* ===== STATE ===== */
var students=[], teachers=[], curTab='scan', dbLoaded=false;
var camStream=null, ocrRunning=false;

/* ===== DATA LAYER ===== */
async function loadData(){
  if(dbLoaded)return;
  document.getElementById('mc').innerHTML='<div style="text-align:center;padding:80px"><div style="width:36px;height:36px;border:3px solid #E8EAED;border-top-color:#1A73E8;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 16px"></div><p style="color:#5F6368">Loading from Firestore...</p></div>';
  
  try {
    students = await fbGetStudents();
    teachers = await fbGetTeachers();
  } catch(e) {
    students = JSON.parse(localStorage.getItem('skpps_students')||'[]');
    teachers = JSON.parse(localStorage.getItem('skpps_teachers')||'[]');
  }
  
  if(!students.length) students = JSON.parse(localStorage.getItem('skpps_students')||'[]');
  if(!teachers.length) teachers = JSON.parse(localStorage.getItem('skpps_teachers')||'[]');
  
  dbLoaded = true;
  render();
}

function saveLocal(){
  localStorage.setItem('skpps_students', JSON.stringify(students));
  localStorage.setItem('skpps_teachers', JSON.stringify(teachers));
}

/* ===== NAVIGATION ===== */
window.logout = function(){ sessionStorage.clear(); location.href='../staff-login.html'; };
window.showTab = function(t){ curTab=t; stopCamera(); render(); };

/* ===== RENDER ===== */
function render(){
  if(!dbLoaded){ loadData(); return; }
  var h = '';
  h += '<div class="stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">';
  h += '<div class="stat" style="background:white;padding:18px;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED"><div style="font-size:28px;font-weight:700">'+students.length+'</div><div style="font-size:10px;color:#9AA0A6;text-transform:uppercase;letter-spacing:.5px;margin-top:2px">Students</div></div>';
  h += '<div class="stat" style="background:white;padding:18px;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED"><div style="font-size:28px;font-weight:700">'+teachers.length+'</div><div style="font-size:10px;color:#9AA0A6;text-transform:uppercase;letter-spacing:.5px;margin-top:2px">Teachers</div></div>';
  h += '<div class="stat" style="background:white;padding:18px;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED"><div style="font-size:28px;font-weight:700">'+(students.length?new Set(students.map(function(s){return s.class||s.cls})).size:0)+'</div><div style="font-size:10px;color:#9AA0A6;text-transform:uppercase;letter-spacing:.5px;margin-top:2px">Classes</div></div>';
  h += '</div>';
  
  h += '<div style="display:flex;gap:0;margin-bottom:16px;border-bottom:2px solid #E8EAED">';
  h += '<button style="padding:10px 20px;border:none;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:'+(curTab==='scan'?'#1A73E8':'#80868B')+';position:relative;font-family:inherit" onclick="showTab(\'scan\')">ID Scanner</button>';
  h += '<button style="padding:10px 20px;border:none;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:'+(curTab==='bulk'?'#1A73E8':'#80868B')+';position:relative;font-family:inherit" onclick="showTab(\'bulk\')">Bulk Import</button>';
  h += '<button style="padding:10px 20px;border:none;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:'+(curTab==='teacher'?'#1A73E8':'#80868B')+';position:relative;font-family:inherit" onclick="showTab(\'teacher\')">Teachers</button>';
  h += '<button style="padding:10px 20px;border:none;background:transparent;font-size:13px;font-weight:500;cursor:pointer;color:'+(curTab==='all'?'#1A73E8':'#80868B')+';position:relative;font-family:inherit" onclick="showTab(\'all\')">All Students</button>';
  h += '</div>';
  
  if(curTab==='scan') h += renderScanner();
  else if(curTab==='bulk') h += renderBulk();
  else if(curTab==='teacher') h += renderTeachers();
  else h += renderAll();
  
  document.getElementById('mc').innerHTML = h;
  if(curTab==='scan') setTimeout(startCamera, 300);
}

/* ============================================================
   SCANNER - Portrait, Capture → OCR → Verify → Save
   ============================================================ */
function renderScanner(){
  return '<div style="display:grid;grid-template-columns:380px 1fr;gap:16px;align-items:start">'+
    '<div>'+
      '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden">'+
        '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px">'+
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Live Camera'+
        '</div>'+
        '<div style="padding:0">'+
          '<div id="camBox" style="background:#000;overflow:hidden;position:relative;aspect-ratio:3/4">'+
            '<video id="camVid" autoplay playsinline style="width:100%;height:100%;object-fit:cover"></video>'+
            '<canvas id="camCanvas" style="display:none"></canvas>'+
            '<div style="position:absolute;inset:8% 10%;border:2px dashed rgba(255,255,255,.5);border-radius:12px;pointer-events:none;z-index:2"></div>'+
            '<div id="camLabel" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.75);color:white;padding:5px 14px;border-radius:14px;font-size:10px;font-weight:500;z-index:3;white-space:nowrap">Position ID card in frame</div>'+
            '<div id="camFlash" style="position:absolute;inset:0;background:rgba(255,255,255,.7);z-index:5;display:none;pointer-events:none"></div>'+
          '</div>'+
          '<div style="display:flex;gap:8px;padding:10px">'+
            '<button id="btnCapture" onclick="captureCard()" style="flex:2;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px;background:#1A73E8;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:46px">'+
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'+
              'Capture ID Card'+
            '</button>'+
            '<button onclick="switchCamera()" style="flex:0;display:inline-flex;align-items:center;justify-content:center;padding:12px 14px;background:white;color:#5F6368;border:1.5px solid #DADCE0;border-radius:8px;cursor:pointer" title="Switch Camera">'+
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>'+
            '</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    // Results panel
    '<div id="resultPanel" style="animation:fadeIn .3s">'+
      '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden">'+
        '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px">Scan Result</div>'+
        '<div style="padding:30px;text-align:center;color:#9AA0A6">'+
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DADCE0" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'+
          '<p style="margin-top:10px;font-size:12px">Capture ID card photo to<br>automatically read student details</p>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}

/* ===== CAMERA (fixed freeze issue) ===== */
var facingMode = 'environment';

function startCamera(){
  var v = document.getElementById('camVid'); if(!v) return;
  stopCamera();
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: facingMode, width: { ideal: 1080 }, height: { ideal: 1440 }, aspectRatio: { ideal: 0.75 } }
  }).then(function(s){
    camStream = s; v.srcObject = s;
    v.onloadedmetadata = function(){ updateCamLabel('Position ID card in frame'); };
  }).catch(function(){
    var box = document.getElementById('camBox');
    if(box) box.innerHTML = '<div style="color:white;text-align:center;padding:50px 20px"><p style="font-size:13px">Camera Required</p><p style="font-size:10px;opacity:.7">Allow camera access and reload</p></div>';
  });
}

function stopCamera(){
  if(camStream){ camStream.getTracks().forEach(function(t){ t.stop(); }); camStream = null; }
}

window.switchCamera = function(){
  facingMode = (facingMode === 'environment' ? 'user' : 'environment');
  stopCamera(); startCamera();
};

function updateCamLabel(msg){
  var el = document.getElementById('camLabel'); if(el) el.textContent = msg;
}

/* ===== CAPTURE → OCR → SHOW (fixed freeze!) ===== */
window.captureCard = function(){
  if(ocrRunning) return;
  var v = document.getElementById('camVid'), btn = document.getElementById('btnCapture');
  if(!v || v.readyState < 2){ updateCamLabel('Camera not ready'); return; }

  // Flash effect
  var flash = document.getElementById('camFlash');
  if(flash){ flash.style.display = 'block'; setTimeout(function(){ flash.style.display = 'none'; }, 300); }

  // Draw to hidden canvas instantly (no freeze)
  var canvas = document.getElementById('camCanvas');
  var ctx = canvas.getContext('2d');
  canvas.width = v.videoWidth; canvas.height = v.videoHeight;
  ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
  var imageData = canvas.toDataURL('image/jpeg', 0.85);
  updateCamLabel('Photo captured');

  // Show processing state in button
  btn.innerHTML = '<div style="width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite"></div> Processing...';
  btn.disabled = true;
  btn.style.opacity = '0.8';

  // Update result panel
  document.getElementById('resultPanel').innerHTML = 
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden;animation:fadeIn .3s">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px">Processing</div>'+
    '<div style="padding:40px 20px;text-align:center">'+
    '<div style="width:40px;height:40px;border:3px solid #E8EAED;border-top-color:#1A73E8;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 16px"></div>'+
    '<p style="font-size:13px;color:#5F6368" id="ocrProgress">Initializing OCR...</p>'+
    '</div></div>';

  // DEFER OCR to prevent UI freeze!
  ocrRunning = true;
  setTimeout(function(){
    runOCR(canvas, btn);
  }, 100);
};

function runOCR(canvas, btn){
  // Load image from canvas
  var img = new Image();
  img.onload = function(){
    updateProgress('Reading text: 0%');
    
    Tesseract.recognize(img, 'eng', {
      logger: function(m){
        if(m.status === 'recognizing text'){
          updateProgress('Reading text: '+Math.round(m.progress*100)+'%');
        }
      }
    }).then(function(result){
      var parsed = parseIDCard(result.data.text);
      showScanResult(parsed, result.data.text);
      
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Capture Next Card';
      btn.disabled = false;
      btn.style.opacity = '1';
      updateCamLabel('Ready for next card');
      ocrRunning = false;
    }).catch(function(e){
      showScanError('OCR failed. Try again with better lighting.');
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Retry';
      btn.disabled = false;
      btn.style.opacity = '1';
      ocrRunning = false;
    });
  };
  img.src = canvas.toDataURL('image/jpeg', 0.8);
}

function updateProgress(msg){
  var el = document.getElementById('ocrProgress');
  if(el) el.textContent = msg;
}

/* ===== SMART PARSER ===== */
function parseIDCard(text){
  var clean = text.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@\(\)]/g, ' ').replace(/\s+/g, ' ').trim();
  var allWords = clean.split(/\s+/).filter(function(w){ return w.length > 1; });
  var lines = clean.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
  var found = { name:'', cls:'', sec:'', roll:'', sid:'', father:'', phone:'', dob:'', blood:'' };

  // Name: 2 consecutive capitalized words
  for(var i=0; i<allWords.length-1; i++){
    if(!found.name && /^[A-Z][a-z]{2,}$/.test(allWords[i]) && /^[A-Z][a-z]{2,}$/.test(allWords[i+1])){
      if(!/^(Class|Roll|Father|Mother|Blood|Phone|House|Student|Admission|Date|DOB|Name)$/i.test(allWords[i])){
        found.name = allWords[i] + ' ' + allWords[i+1];
      }
    }
  }

  for(var i=0; i<lines.length; i++){
    var l = lines[i], lo = l.toLowerCase();
    if(!found.cls && l.match(/^(Nursery|LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i))
      found.cls = l.toUpperCase();
    else if(!found.cls && lo.includes('class')) found.cls = l.replace(/class[:.\s-]*/i,'').trim().toUpperCase();
    
    if(!found.roll && lo.includes('roll')) found.roll = l.replace(/^(roll|rno|roll no)[:.\s-]*/i,'').trim();
    else if(!found.roll && l.match(/^\d{1,3}$/) && parseInt(l) > 0 && parseInt(l) <= 100) found.roll = l;
    
    if(!found.sid && (lo.includes('student id')||lo.includes('admission')))
      found.sid = l.replace(/^(student id|admission no|admission|adm no|id)[:.\s-]*/i,'').trim();
    else if(!found.sid && l.match(/^SKPPS/i)) found.sid = l;
    
    if(!found.father && lo.includes('father')) found.father = l.replace(/^(father|father name|father\'s name)[:.\s-]*/i,'').trim();
    
    if(!found.phone && l.replace(/\D/g,'').match(/^\d{10}$/)) found.phone = l.replace(/\D/g,'');
    
    if(!found.dob && (lo.includes('dob')||lo.includes('birth')||lo.includes('date of birth')))
      found.dob = l.replace(/^(dob|birth|date of birth|d\.o\.b)[:.\s-]*/i,'').trim();
    else if(!found.dob && l.match(/^\d{2}[\/-]\d{2}[\/-]\d{4}$/)) found.dob = l;
    
    if(!found.blood && l.match(/^(A|B|AB|O)[+-]$/i)) found.blood = l.toUpperCase();
  }

  // Detect section
  if(!found.sec){
    for(var i=0; i<lines.length; i++){
      var m = lines[i].match(/\b([A-C])\b/);
      if(m && !found.sec){ found.sec = m[1]; break; }
    }
  }

  return found;
}

/* ===== SHOW RESULT ===== */
function showScanResult(data, rawText){
  var sid = data.sid || ('SKPPS'+Date.now().toString(36).toUpperCase());
  var h = '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:2px solid #4ade80;overflow:hidden;animation:fadeIn .3s">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px;color:#059669;display:flex;align-items:center;gap:6px">'+
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>ID Card Detected'+
    '</div>'+
    '<div style="padding:16px">'+
      '<details style="margin-bottom:12px"><summary style="font-size:11px;color:#9AA0A6;cursor:pointer">View OCR text</summary><pre style="font-size:10px;background:#F8F9FA;padding:8px;border-radius:6px;max-height:80px;overflow:auto;margin-top:6px;font-family:monospace;white-space:pre-wrap;word-break:break-all">'+esc(rawText)+'</pre></details>'+
      '<form id="scanForm" onsubmit="return saveScanned(event)">'+
        '<input type="hidden" name="sid" value="'+sid+'">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Student ID</label><input name="stid" value="'+esc(sid)+'" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Full Name *</label><input name="name" value="'+esc(data.name)+'" required autofocus style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Class *</label><input name="cls" value="'+esc(data.cls)+'" required style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Section</label><select name="sec" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"><option '+(data.sec==='A'?'selected':'')+'>A</option><option '+(data.sec==='B'?'selected':'')+'>B</option><option '+(data.sec==='C'?'selected':'')+'>C</option></select></div>'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Roll No</label><input name="roll" value="'+esc(data.roll)+'" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Date of Birth</label><input name="dob" type="date" value="'+esc(data.dob)+'" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">House</label><select name="house" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Father Name</label><input name="father" value="'+esc(data.father)+'" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
          '<div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Blood Group</label><input name="blood" value="'+esc(data.blood)+'" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
        '</div>'+
        '<div style="margin-bottom:8px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Parent Phone</label><input name="phone" value="'+esc(data.phone)+'" type="tel" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div>'+
        '<div style="display:flex;gap:8px;margin-top:12px">'+
          '<button type="submit" style="flex:1;padding:12px;background:#27AE60;color:white;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save to Firestore</button>'+
          '<button type="button" onclick="resetScanner()" style="padding:12px 18px;background:white;color:#5F6368;border:1.5px solid #DADCE0;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Cancel</button>'+
        '</div>'+
      '</form>'+
    '</div></div>';
  document.getElementById('resultPanel').innerHTML = h;
}

function showScanError(msg){
  document.getElementById('resultPanel').innerHTML = 
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden;animation:fadeIn .3s">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px;color:#DC2626">Scan Failed</div>'+
    '<div style="padding:16px"><div style="background:#FEF2F2;color:#DC2626;padding:10px 12px;border-radius:6px;font-size:12px;border-left:3px solid #DC2626;margin-bottom:8px">'+msg+'</div>'+
    '<p style="font-size:11px;color:#5F6368;margin-bottom:10px">Tips: Ensure good lighting, hold card still, fill the frame.</p>'+
    '<button onclick="resetScanner()" style="padding:10px 16px;background:white;color:#5F6368;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Dismiss</button></div></div>';
}

window.resetScanner = function(){
  document.getElementById('resultPanel').innerHTML = 
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px">Scan Result</div>'+
    '<div style="padding:30px;text-align:center;color:#9AA0A6">'+
    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DADCE0" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'+
    '<p style="margin-top:10px;font-size:12px">Capture ID card to read details</p></div></div>';
  updateCamLabel('Position ID card in frame');
};

function esc(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ===== SAVE STUDENT ===== */
window.saveScanned = async function(e){
  e.preventDefault(); var f = e.target;
  var sid = f.stid.value || f.sid.value || ('SKPPS'+Date.now().toString(36).toUpperCase()),
      name = f.name.value, cls = f.cls.value, sec = f.sec.value, roll = parseInt(f.roll.value)||0,
      dob = f.dob.value || '2000-01-01', father = f.father.value, phone = f.phone.value,
      blood = f.blood.value, house = f.house.value;
  if(!name || !cls){ alert('Name and Class are required'); return false; }
  
  var st = { student_id: sid, full_name: name, class: cls, section: sec, roll_no: roll,
    date_of_birth: dob, father_name: father, parent_phone: phone, blood_group: blood,
    house: house, is_active: true, password: dob.replace(/-/g,'').substring(0,8),
    added_at: new Date().toISOString() };
  
  students.push(st); saveLocal();
  
  var cloudSaved = await fbAddStudent(st);
  
  document.getElementById('resultPanel').innerHTML = 
    '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:2px solid #059669;overflow:hidden;animation:fadeIn .3s">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px;color:#059669;display:flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Student Saved</div>'+
    '<div style="padding:16px"><p style="font-size:14px;line-height:1.8"><strong>'+esc(name)+'</strong> added to '+(cloudSaved?'Firestore':'local storage')+'.</p>'+
    '<p style="font-size:11px;color:#5F6368;margin-top:4px">ID: '+esc(sid)+' | Class: '+esc(cls)+'-'+esc(sec)+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</p>'+
    '<button onclick="resetScanner()" style="margin-top:12px;padding:10px 16px;background:white;color:#5F6368;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Scan Another Card</button></div></div>';
  return false;
};

/* ===== BULK IMPORT ===== */
function renderBulk(){
  return '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px">Bulk Import (CSV)</div>'+
    '<div style="padding:16px">'+
    '<p style="font-size:11px;color:#5F6368;margin-bottom:10px">Paste CSV from existing school software. Format: ID, Name, Class, Section, Roll, DOB(YYYY-MM-DD), Father, Mother, Phone, Gender, House</p>'+
    '<textarea id="csvData" style="width:100%;height:160px;border:1.5px solid #DADCE0;border-radius:8px;padding:10px;font-family:monospace;font-size:10px" placeholder="SKPPS2024001,John Smith,V,A,8,2017-05-10,Robert,Mary,9876543210,Male,Earth"></textarea>'+
    '<div style="display:flex;gap:10px;margin-top:10px">'+
    '<button onclick="runImport()" id="btnImport" style="padding:10px 18px;background:#1A73E8;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Import to Database</button>'+
    '<span id="importCount" style="font-size:11px;color:#5F6368;align-self:center"></span></div>'+
    '<div id="csvMsg" style="margin-top:8px"></div></div></div>';
}

window.runImport = async function(){
  var t = document.getElementById('csvData').value.trim(); if(!t) return;
  var btn = document.getElementById('btnImport'); btn.disabled = true; btn.textContent = 'Importing...';
  var lines = t.split('\n').filter(Boolean), added = 0, skipped = 0, cloudCount = 0;
  
  for(var i=0; i<lines.length; i++){
    var c = lines[i].split(',').map(function(x){ return x.trim(); });
    if(c.length < 6){ skipped++; continue; }
    var sid = c[0]||('SKPPS'+Date.now().toString(36).toUpperCase()), name=c[1], cls=c[2], sec=c[3]||'A',
        roll=parseInt(c[4])||0, dob=c[5]||'2000-01-01', father=c[6]||'', mother=c[7]||'',
        phone=c[8]||'', gender=c[9]||'Male', house=c[10]||'Earth';
    if(!name||!cls){ skipped++; continue; }
    var st = { student_id:sid, full_name:name, class:cls, section:sec, roll_no:roll, date_of_birth:dob,
      father_name:father, mother_name:mother, parent_phone:phone, gender:gender, house:house,
      is_active:true, password:dob.replace(/-/g,'').substring(0,8), added_at:new Date().toISOString() };
    students.push(st); added++;
    var ok = await fbAddStudent(st);
    if(ok) cloudCount++;
  }
  
  saveLocal(); btn.disabled = false; btn.textContent = 'Import to Database';
  document.getElementById('csvMsg').innerHTML = '<div style="background:#ECFDF5;color:#059669;padding:10px 12px;border-radius:6px;font-size:11px;border-left:3px solid #059669">Imported: '+added+' students ('+cloudCount+' to Firestore). Skipped: '+skipped+' invalid.</div>';
};

/* ===== TEACHERS ===== */
function renderTeachers(){
  var rows = '';
  if(!teachers.length) rows = '<tr><td colspan="3" style="text-align:center;padding:24px;color:#9AA0A6">No teachers added yet. Add staff accounts below.</td></tr>';
  else for(var i=0; i<teachers.length; i++){
    var t = teachers[i]; rows += '<tr><td><strong>'+esc(t.full_name)+'</strong></td><td>'+esc(t.username)+'</td><td><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;background:#E6F4EA;color:#27AE60">Active</span></td></tr>';
  }
  return '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px">Teacher Accounts</div>'+
    '<div style="padding:16px">'+
    '<form onsubmit="return addTeacher(event)" style="margin-bottom:14px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px"><div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Full Name</label><input id="tn" required style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div><div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Username</label><input id="tu" required style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Password</label><input type="password" id="tpw" required minlength="4" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div><div style="margin-bottom:6px"><label style="display:block;font-size:10px;font-weight:600;color:#5F6368;text-transform:uppercase;margin-bottom:2px">Email</label><input type="email" id="te" style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit"></div></div><button type="submit" style="margin-top:6px;padding:10px 20px;background:#1A73E8;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Add Teacher</button></form>'+
    '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><tr style="background:#F8F9FA"><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Name</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Username</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Status</th></tr>'+rows+'</table></div></div></div>';
}

window.addTeacher = async function(e){
  e.preventDefault();
  var n = document.getElementById('tn').value.trim(), u = document.getElementById('tu').value.trim(),
      p = document.getElementById('tpw').value.trim(), em = document.getElementById('te').value.trim();
  var t = { username: u, password: p, full_name: n, email: em, is_active: true };
  teachers.push(t); saveLocal();
  await fbAddTeacher(t);
  render(); return false;
};

/* ===== ALL STUDENTS ===== */
function renderAll(){
  var rows = '';
  if(!students.length) rows = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#9AA0A6">No students in database. Use Scanner or Import.</td></tr>';
  else for(var i=0; i<students.length; i++){
    var s = students[i], hc = s.house || 'Earth';
    rows += '<tr><td>'+esc(s.student_id)+'</td><td><strong>'+esc(s.full_name)+'</strong></td><td>'+esc(s.class)+'</td><td>'+esc(s.section)+'</td><td>'+s.roll_no+'</td><td><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;text-transform:uppercase;'+(hc==='Earth'?'background:#E6F4EA;color:#27AE60':hc==='Fire'?'background:#FDE8E8;color:#E74C3C':hc==='Water'?'background:#E3F0FD;color:#3498DB':'background:#FEF3E0;color:#F39C12')+'">'+hc+'</span></td><td>'+esc(s.parent_phone)+'</td><td style="font-size:10px">'+esc(s.date_of_birth)+'</td></tr>';
  }
  return '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #E8EAED;overflow:hidden">'+
    '<div style="padding:12px 16px;border-bottom:1px solid #F1F3F4;font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px">All Students ('+students.length+')</div>'+
    '<div style="padding:16px"><input style="width:100%;padding:9px 12px;border:1.5px solid #DADCE0;border-radius:6px;font-size:12px;font-family:inherit;margin-bottom:12px" placeholder="Search by name, class, roll, or ID..." oninput="filterStudents(this.value)"><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px" id="stbl"><tr style="background:#F8F9FA"><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">ID</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Name</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Class</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Sec</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Roll</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">House</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">Phone</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:#5F6368;border-bottom:2px solid #E8EAED">DOB</th></tr>'+rows+'</table></div></div></div>';
}

window.filterStudents = function(q){
  var rows = document.querySelectorAll('#stbl tr');
  for(var i=1; i<rows.length; i++) rows[i].style.display = rows[i].textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
};

/* ===== INIT ===== */
loadData();

})();
