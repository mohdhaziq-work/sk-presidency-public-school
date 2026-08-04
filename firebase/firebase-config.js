/* SKPPS Firebase Config - Override via firebase-setup.html or edit directly */
var FIREBASE_CONFIG={apiKey:"AIzaSyDYHVi3c-cNvdcMON5wcPjRrJ1nxpdrw2Y",authDomain:"sk-presidency-public-school.firebaseapp.com",projectId:"sk-presidency-public-school",storageBucket:"sk-presidency-public-school.firebasestorage.app",messagingSenderId:"808351998605",appId:"1:808351998605:web:0c8d072cfea4efa74278c4"};
(function(){var c=localStorage.getItem("skpps_firebase_config");if(c){try{FIREBASE_CONFIG=JSON.parse(c)}catch(e){}}})();

let _db = null, _auth = null, _initialized = false;

async function loadScript(src) {
  if (document.querySelector('script[src="' + src + '"]')) return true;
  return new Promise(function(resolve) {
    var s = document.createElement('script'); s.src = src;
    s.onload = function() { resolve(true); };
    s.onerror = function() { resolve(false); };
    document.head.appendChild(s);
  });
}

async function initFirebase() {
  if (_db) return { db: _db, auth: _auth };
  if (typeof firebase === 'undefined') {
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js');
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.firestore();
    _auth = firebase.auth();
    try { await _db.enablePersistence({ synchronizeTabs: true }); } catch(e) {}
    _initialized = true;
    return { db: _db, auth: _auth };
  } catch(e) { console.warn('Firebase init failed, using local fallback'); return null; }
}

/* ===== STUDENT CRUD ===== */
async function fbAddStudent(data) {
  var fb = await initFirebase();
  if (!fb) { var arr = JSON.parse(localStorage.skpps_students || '[]'); arr.push(data); localStorage.skpps_students = JSON.stringify(arr); return data; }
  if (!data.student_id) { var snap = await fb.db.collection('students').get(); data.student_id = 'SKPPS' + new Date().getFullYear() + String(snap.size + 1).padStart(3, '0'); }
  data.password = data.password || data.dob.replace(/-/g, '').substring(0, 8);
  data.created_at = firebase.firestore.FieldValue.serverTimestamp();
  await fb.db.collection('students').doc(data.student_id).set(data, { merge: true });
  return data;
}

async function fbGetStudents() {
  var fb = await initFirebase();
  if (!fb) return JSON.parse(localStorage.skpps_students || '[]');
  var snap = await fb.db.collection('students').where('is_active', '==', true).orderBy('class').orderBy('roll_no').get();
  return snap.docs.map(function(d) { var r = d.data(); r.student_id = d.id; return r; });
}

async function fbFindStudent(sid) {
  var fb = await initFirebase();
  if (!fb) {
    var arr = JSON.parse(localStorage.skpps_students || '[]');
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].student_id === sid || arr[i].admission_no === sid || String(arr[i].roll_no) === sid) return arr[i];
    }
    return null;
  }
  var doc = await fb.db.collection('students').doc(sid).get();
  if (doc.exists) { var r = doc.data(); r.student_id = doc.id; return r; }
  var snap = await fb.db.collection('students').where('admission_no', '==', sid).limit(1).get();
  if (!snap.empty) { var r = snap.docs[0].data(); r.student_id = snap.docs[0].id; return r; }
  var snap2 = await fb.db.collection('students').where('roll_no', '==', parseInt(sid) || 0).limit(1).get();
  if (!snap2.empty) { var r = snap2.docs[0].data(); r.student_id = snap2.docs[0].id; return r; }
  return null;
}

/* ===== TEACHER CRUD ===== */
async function fbAddTeacher(data) {
  var fb = await initFirebase();
  if (!fb) { var arr = JSON.parse(localStorage.skpps_teachers || '[]'); arr.push(data); localStorage.skpps_teachers = JSON.stringify(arr); return data; }
  data.created_at = firebase.firestore.FieldValue.serverTimestamp();
  await fb.db.collection('teachers').doc(data.username).set(data, { merge: true });
  return data;
}

async function fbGetTeachers() {
  var fb = await initFirebase();
  if (!fb) return JSON.parse(localStorage.skpps_teachers || '[]');
  var snap = await fb.db.collection('teachers').get();
  return snap.docs.map(function(d) { var r = d.data(); r.username = d.id; return r; });
}

async function fbFindTeacher(username) {
  var fb = await initFirebase();
  if (!fb) {
    var arr = JSON.parse(localStorage.skpps_teachers || '[]');
    for (var i = 0; i < arr.length; i++) { if (arr[i].username === username) return arr[i]; }
    return null;
  }
  var doc = await fb.db.collection('teachers').doc(username).get();
  return doc.exists ? doc.data() : null;
}
