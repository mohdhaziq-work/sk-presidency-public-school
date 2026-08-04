/* ============================================================
   SKPPS Firebase Configuration Template
   ============================================================
   1. Copy this file to: firebase/firebase-config.js
   2. Go to console.firebase.google.com → Project Settings
   3. Replace placeholder values with your real Firebase config
   4. firebase-config.js is gitignored - never committed!
   ============================================================ */

var FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Also supports loading from localStorage (set via firebase-setup.html)
(function() {
  var stored = localStorage.getItem("skpps_firebase_config");
  if (stored) {
    try { FIREBASE_CONFIG = JSON.parse(stored); } catch(e) {}
  }
})();
