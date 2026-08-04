/* SKPPS Management Panel - Firebase + Improved OCR Scanner */
(function() {
if(!sessionStorage.getItem('skpps_auth')||sessionStorage.getItem('skpps_role')!=='mgmt'){location.href='../staff-login.html'}
document.getElementById('uname').textContent=' - '+(sessionStorage.getItem('skpps_name')||'Admin');

var students=[],teachers=[],curTab='scan',dataLoaded=false;
var camStream=null,scanTimer=null,scanActive=false,lastScanText='',scanHits=0,ocrWorker=null;
window.logout=function(){sessionStorage.clear();location.href='../staff-login.html'};
window.showTab=function(t){curTab=t;if(curTab!=='scan')stopScanner();render()};

/* ===== LOAD DATA FROM FIREBASE ===== */
async function loadData(){
  try{students=await fbGetStudents();teachers=await fbGetTeachers()}catch(e){students=[];teachers=[]}
  dataLoaded=true;render();
}

/* ===== RENDER ===== */
function render(){
  if(!dataLoaded){document.getElementById('mc').innerHTML='<div style="text-align:center;padding:60px"><div style="width:36px;height:36px;border:3px solid #E8EAED;border-top-color:#1A73E8;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 16px"></div><p style="color:#5F6368;font-size:14px">Connecting to Firebase...</p></div>';return}
  var s=students,t=teachers,h='';
  h+='<div class="stats"><div class="stat"><div class="v">'+s.length+'</div><div class="l">Students (Firestore)</div></div><div class="stat"><div class="v">'+t.length+'</div><div class="l">Teachers</div></div><div class="stat"><div class="v">'+(s.length?new Set(s.map(function(x){return x.class||x.cls})).size:0)+'</div><div class="l">Classes</div></div></div>';
  h+='<div class="tabs-nav"><button class="'+(curTab==='scan'?'active':'')+'" onclick="showTab(\'scan\')">ID Scanner</button><button class="'+(curTab==='bulk'?'active':'')+'" onclick="showTab(\'bulk\')">Bulk Import</button><button class="'+(curTab==='teacher'?'active':'')+'" onclick="showTab(\'teacher\')">Teachers</button><button class="'+(curTab==='all'?'active':'')+'" onclick="showTab(\'all\')">All Students</button></div>';
  if(curTab==='scan')h+=rScan();else if(curTab==='bulk')h+=rBulk();else if(curTab==='teacher')h+=rTeacher(t);else h+=rAll(s);
  document.getElementById('mc').innerHTML=h;
  if(curTab==='scan'){stopScanner();setTimeout(startScanner,400)}
}

function rScan(){return '<div class="card"><div class="ch">Smart ID Card Scanner</div><div class="cb"><div style="background:#f0f7ff;padding:10px 14px;border-radius:8px;margin-bottom:12px;font-size:12px;color:#5F6368;display:flex;align-items:center;gap:8px;border-left:3px solid #1A73E8"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Point camera at ID card. Hold steady for auto-detection. Text appears below when recognized.</span></div><div id="camBox" style="background:#000;border-radius:8px;overflow:hidden;position:relative;aspect-ratio:16/9;max-width:560px"><video id="camVid" autoplay playsinline style="width:100%;height:100%;object-fit:cover"></video><canvas id="camCanvas" style="display:none"></canvas><div style="position:absolute;inset:0;pointer-events:none"><div style="position:absolute;top:8%;left:10%;right:10%;bottom:8%;border:3px solid rgba(255,255,255,0.55);border-radius:14px;box-shadow:0 0 0 9999px rgba(0,0,0,0.25)"></div><div id="scanStatus" style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:7px 18px;border-radius:20px;font-size:11px;font-weight:500">Ready - Point at ID Card</div></div></div><div id="debugText" style="margin-top:10px;padding:10px;background:#F8F9FA;border-radius:8px;font-size:11px;color:#5F6368;max-height:100px;overflow-y:auto;display:none;font-family:monospace;white-space:pre-wrap;word-break:break-all"></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-b" onclick="manualCapture()">Manual Capture</button><button class="btn btn-o" onclick="stopScanner();curTab=\'all\';render()">Stop Scanner</button></div><div id="scanOut" style="margin-top:12px"></div></div></div>'}
function rBulk(){return '<div class="card"><div class="ch">Bulk Import</div><div class="cb"><p style="font-size:12px;color:#5F6368;margin-bottom:10px">Paste CSV data. Format per line:</p><code style="display:block;background:#F8F9FA;padding:8px;border-radius:8px;font-size:10px;margin-bottom:10px;word-break:break-all">StudentID,FullName,Class,Section,RollNo,DOB(YYYY-MM-DD),FatherName,MotherName,Phone,Gender,House</code><textarea id="csvData" style="width:100%;height:140px;border:1.5px solid #DADCE0;border-radius:8px;padding:10px;font-family:monospace;font-size:10px"></textarea><button class="btn btn-b mt1" onclick="importCSV()">Import to Firebase</button><div id="csvMsg" class="mt1"></div></div></div>'}
function rTeacher(t){var rows='';if(t.length===0)rows='<tr><td colspan="3" style="text-align:center;padding:20px;color:#9AA0A6">No teachers yet</td></tr>';else for(var i=0;i<t.length;i++)rows+='<tr><td>'+t[i].full_name+'</td><td>'+t[i].username+'</td><td><span class="badge-sm bg">Active</span></td></tr>';return '<div class="card"><div class="ch">Add Teacher</div><div class="cb"><form onsubmit="return addTeacher(event)"><div class="r2"><div class="fg"><label>Full Name</label><input id="tn" required></div><div class="fg"><label>Username</label><input id="tu" required></div></div><div class="r2"><div class="fg"><label>Password</label><input type="password" id="tpw" required minlength="4"></div><div class="fg"><label>Email</label><input type="email" id="te"></div></div><button type="submit" class="btn btn-b mt1">Add Teacher</button></form><h4 style="font-size:12px;color:#5F6368;margin-top:16px;margin-bottom:8px">Teachers ('+t.length+')</h4><div class="tw"><table class="dt"><tr><th>Name</th><th>Username</th><th>Status</th></tr>'+rows+'</table></div></div></div>'}
function rAll(s){var rows='';if(s.length===0)rows='<tr><td colspan="8" style="text-align:center;padding:30px;color:#9AA0A6">Empty. Use Scanner or Import.</td></tr>';else for(var i=0;i<s.length;i++){var hc=s[i].house||'Earth',nm=s[i].full_name||s[i].name||'',si=s[i].student_id||s[i].sid||'',cl=s[i].class||s[i].cls||'',sc=s[i].section||s[i].sec||'A',rn=s[i].roll_no||s[i].roll||0,ph=s[i].parent_phone||s[i].phone||'',db=s[i].date_of_birth||s[i].dob||'';rows+='<tr><td>'+si+'</td><td><strong>'+nm+'</strong></td><td>'+cl+'</td><td>'+sc+'</td><td>'+rn+'</td><td><span class="badge-sm '+(hc==='Earth'?'bg':hc==='Fire'?'br':hc==='Water'?'bb':'by')+'">'+hc+'</span></td><td>'+ph+'</td><td style="font-size:10px">'+db+'</td></tr>'}return '<div class="card"><div class="ch">All Students ('+s.length+')</div><div class="cb"><input style="width:100%;padding:8px 10px;border:1.5px solid #DADCE0;border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:10px" placeholder="Search..." oninput="filterStudents(this.value)"><div class="tw"><table class="dt" id="stbl"><tr><th>ID</th><th>Name</th><th>Class</th><th>Sec</th><th>Roll</th><th>House</th><th>Phone</th><th>DOB</th></tr>'+rows+'</table></div></div></div>'}
window.filterStudents=function(q){var r=document.querySelectorAll('#stbl tr');for(var i=1;i<r.length;i++)r[i].style.display=r[i].textContent.toLowerCase().includes(q.toLowerCase())?'':'none'}

/* ===== ADD TEACHER ===== */
window.addTeacher=async function(e){e.preventDefault();var n=document.getElementById('tn').value.trim(),u=document.getElementById('tu').value.trim(),p=document.getElementById('tpw').value.trim(),em=document.getElementById('te').value.trim();await fbAddTeacher({username:u,password:p,full_name:n,email:em,is_active:true});await loadData();render();return false}

/* ===== CSV IMPORT ===== */
window.importCSV=async function(){var t=document.getElementById('csvData').value.trim();if(!t)return;var l=t.split('\n'),added=0,skipped=0;for(var i=0;i<l.length;i++){var c=l[i].split(',').map(function(x){return x.trim()});if(c.length<6){skipped++;continue}var sid=c[0]||'',name=c[1],cls=c[2],sec=c[3]||'A',roll=parseInt(c[4])||0,dob=c[5]||'2000-01-01',father=c[6]||'',mother=c[7]||'',phone=c[8]||'',gender=c[9]||'Male',house=c[10]||'Earth';if(!name||!cls){skipped++;continue}try{await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,father_name:father,mother_name:mother,parent_phone:phone,gender:gender,house:house,is_active:true});added++}catch(e){skipped++}}document.getElementById('csvMsg').innerHTML='<div class="alert aok">Imported: '+added+' to Firestore. Skipped: '+skipped+'</div>';await loadData();render()}

/* ===== IMPROVED CAMERA + OCR SCANNER ===== */
function startScanner(){var v=document.getElementById('camVid');if(!v)return;if(camStream){scanActive=true;updateStatus('Scanning...','white');startScanLoop();return}navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1920},height:{ideal:1080}}}).then(function(s){camStream=s;v.srcObject=s;v.onloadedmetadata=function(){scanActive=true;updateStatus('Scanning...','white');startScanLoop()}}).catch(function(){var b=document.getElementById('camBox');if(b)b.innerHTML='<div style="color:white;text-align:center;padding:40px"><p style="font-size:15px;margin-bottom:8px">Camera Access Required</p><p style="font-size:12px;opacity:0.7">Please allow camera permission and reload the page</p></div>'})}
function stopScanner(){scanActive=false;if(scanTimer)clearInterval(scanTimer);if(camStream){camStream.getTracks().forEach(function(t){t.stop()});camStream=null}lastScanText='';scanHits=0}
function updateStatus(m,c){var e=document.getElementById('scanStatus');if(e){e.textContent=m;if(c)e.style.color=c}}

function startScanLoop(){if(scanTimer)clearInterval(scanTimer);scanTimer=setInterval(function(){if(!scanActive)return;captureAndDetect()},1500)}

async function captureAndDetect(){
  var v=document.getElementById('camVid'),c=document.getElementById('camCanvas');if(!v||!c||v.readyState<2)return;
  c.width=v.videoWidth;c.height=v.videoHeight;var ctx=c.getContext('2d');ctx.drawImage(v,0,0);

  // Show debug: latest raw capture
  var debugDiv=document.getElementById('debugText');if(debugDiv)debugDiv.style.display='block';

  try{
    // Try English first, then with different settings if needed
    var result=await Tesseract.recognize(c,'eng',{
      logger:function(m){if(m.status==='recognizing text')updateStatus('Reading: '+Math.round(m.progress*100)+'%','rgba(100,255,180,0.9)')}
    });
    var rawText=result.data.text;
    var txt=rawText.replace(/[^a-zA-Z0-9\s\/\-\.\,\:\@\(\)]/g,' ').replace(/\s+/g,' ').trim();
    var lines=txt.split('\n').map(function(l){return l.trim()}).filter(Boolean);

    if(debugDiv)debugDiv.innerHTML='<strong style="color:#1A73E8">OCR Output:</strong>\n'+txt+'\n\n<strong style="color:#1A73E8">Lines:</strong>\n'+lines.join('\n');

    // Score: name (2pts) + class (2pts) + roll (1pt) + id (1pt)
    var score=0,found={name:'',cls:'',roll:'',sid:'',father:'',phone:'',dob:'',blood:''};
    for(var i=0;i<lines.length;i++){
      var l=lines[i],lo=l.replace(/\s+/g,' ').trim().toLowerCase();

      // Name: 2+ word capitalized text not matching other patterns
      if(!found.name&&l.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/)){found.name=l;score+=2}
      else if(!found.name&&(lo.includes('name')||lo.includes('student'))){found.name=l.replace(/^(name|student|student name)[:.\s-]*/i,'').trim();if(found.name.length>3)score+=2}

      // Class
      if(!found.cls&&l.match(/^(Nursery|LKG|UKG|[IVX]+)$/i)){found.cls=l.toUpperCase();score+=2}
      else if(!found.cls&&lo.includes('class')){found.cls=l.replace(/^class[:.\s-]*/i,'').trim().toUpperCase();if(found.cls)score+=2}

      // Roll number
      if(!found.roll&&(lo.includes('roll')||lo.includes('rno'))){found.roll=l.replace(/^(roll|rno|roll no|roll number)[:.\s-]*/i,'').trim();score+=1}
      else if(!found.roll&&l.match(/^\d{1,3}$/)&&parseInt(l)>0&&parseInt(l)<=100){found.roll=l;score+=1}

      // Student ID
      if(!found.sid&&(lo.includes('id')||lo.includes('adm'))){found.sid=l.replace(/^(id|adm|admission|student id|admission no)[:.\s-]*/i,'').trim();score+=1}
      else if(!found.sid&&l.match(/^SKPPS/i)){found.sid=l;score+=1}

      // Father
      if(!found.father&&lo.includes('father')){found.father=l.replace(/^father('s name)?[:.\s-]*/i,'').trim()}

      // Phone
      if(!found.phone&&l.replace(/\s/g,'').match(/^\d{10}$/)){found.phone=l.replace(/\s/g,'')}

      // DOB
      if(!found.dob&&(lo.includes('dob')||lo.includes('birth')||lo.includes('date of birth'))){found.dob=l.replace(/^(dob|birth|date of birth)[:.\s-]*/i,'').trim()}

      // Blood group
      if(!found.blood&&l.match(/^(A|B|AB|O)[+-]$/i)){found.blood=l.toUpperCase()}
    }

    updateStatus('Score: '+score+'/6 | '+(score>=3?'Detected!':'Scanning...'),score>=3?'#4ade80':(score>=2?'rgba(255,255,180,0.9)':'rgba(255,255,255,0.5)'));

    // Need score >= 3 AND text changed from last detection
    if(score>=3&&txt!==lastScanText){
      scanHits++;
      if(scanHits>=2){updateStatus('ID Card Detected!','#4ade80');await onCardDetected(found,txt);lastScanText=txt;scanHits=0}
    }else if(score<3){scanHits=0}
    lastScanText=txt;
  }catch(e){
    if(debugDiv)debugDiv.innerHTML='<span style="color:#DC2626">OCR Error: '+e.message+'</span>';
    updateStatus('Retrying...','rgba(255,150,150,0.6)');
  }
}

async function onCardDetected(found,rawText){
  scanActive=false;if(scanTimer)clearInterval(scanTimer);
  var sid=found.sid||('SKPPS'+Date.now().toString(36).toUpperCase());
  var h='<div style="background:#ECFDF5;padding:14px;border-radius:8px;border:2px solid #4ade80">'+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><strong style="color:#059669">ID Card Detected - Verify & Save</strong></div>'+
    '<details style="margin-bottom:10px"><summary style="font-size:11px;color:#5F6368;cursor:pointer">View raw OCR text</summary><pre style="font-size:10px;background:#F8F9FA;padding:8px;border-radius:4px;max-height:80px;overflow:auto;margin-top:4px">'+rawText+'</pre></details>'+
    '<form id="scanForm" onsubmit="return saveScanned(event)"><input type="hidden" name="sid" value="'+sid+'"><div class="r2"><div class="fg"><label>Student ID</label><input name="stid" value="'+sid+'"></div><div class="fg"><label>Full Name *</label><input name="name" value="'+found.name+'" required></div></div>'+
    '<div class="r2"><div class="fg"><label>Class *</label><input name="cls" value="'+found.cls+'" required></div><div class="fg"><label>Section</label><select name="sec"><option>A</option><option>B</option><option>C</option></select></div></div>'+
    '<div class="r2"><div class="fg"><label>Roll No</label><input name="roll" value="'+found.roll+'"></div><div class="fg"><label>Date of Birth</label><input name="dob" type="date" value="'+found.dob+'"></div></div>'+
    '<div class="r2"><div class="fg"><label>Father Name</label><input name="father" value="'+found.father+'"></div><div class="fg"><label>Parent Phone</label><input name="phone" value="'+found.phone+'"></div></div>'+
    '<div class="r2"><div class="fg"><label>Blood Group</label><input name="blood" value="'+found.blood+'"></div><div class="fg"><label>House</label><select name="house"><option>Earth</option><option>Fire</option><option>Water</option><option>Air</option></select></div></div>'+
    '<div style="display:flex;gap:8px;margin-top:10px"><button type="submit" class="btn btn-b">Save to Firebase</button><button type="button" class="btn btn-o" onclick="scanActive=true;startScanLoop();document.getElementById(\'scanOut\').innerHTML=\'\';document.getElementById(\'debugText\').style.display=\'none\';updateStatus(\'Scanning...\',\'white\')">Scan Another</button></div></form></div>';
  document.getElementById('scanOut').innerHTML=h;
}

window.manualCapture=function(){if(scanTimer)clearInterval(scanTimer);updateStatus('Capturing...','#4ade80');captureAndDetect()}

window.saveScanned=async function(e){
  e.preventDefault();var f=e.target;
  var sid=f.stid.value||f.sid.value||'',name=f.name.value,cls=f.cls.value,sec=f.sec.value,
      roll=parseInt(f.roll.value)||0,dob=f.dob.value||'2000-01-01',father=f.father.value,
      phone=f.phone.value,blood=f.blood.value,house=f.house.value;
  if(!sid)sid='SKPPS'+Date.now().toString(36).toUpperCase();
  try{
    await fbAddStudent({student_id:sid,full_name:name,class:cls,section:sec,roll_no:roll,date_of_birth:dob,father_name:father,parent_phone:phone,blood_group:blood,house:house,is_active:true});
    document.getElementById('scanOut').innerHTML='<div class="alert aok" style="font-size:13px;padding:16px"><strong>'+name+' saved to Firebase!</strong><br>ID: '+sid+' | Class: '+cls+'-'+sec+' | Password: '+dob.replace(/-/g,'').substring(0,8)+' (DOB)</div><button class="btn btn-o mt1" onclick="scanActive=true;startScanLoop();document.getElementById(\'scanOut\').innerHTML=\'\';document.getElementById(\'debugText\').style.display=\'none\';updateStatus(\'Scanning...\',\'white\')">Scan Another</button>';
  }catch(err){
    document.getElementById('scanOut').innerHTML='<div class="alert aerr">Error: '+err.message+'</div>';
  }
  await loadData();render();return false;
}

/* ===== INIT ===== */
loadData();
})();
