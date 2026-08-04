# SKPPS Website - Deployment Guide

## Where Data is Stored

| Environment | Storage |
|-------------|---------|
| GitHub Pages (demo) | Browser localStorage (not shared across devices) |
| With Firebase | Firebase Firestore (all devices share real-time data) |
| With PHP/MySQL | MySQL database on your server |

## Quick Start (Firebase - Recommended)

### Step 1: Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Cloud Firestore** (Test mode for setup, then secure)

### Step 2: Configure
Open `firebase-setup.html` in your browser:
1. Paste your Firebase web app config
2. Choose management security code + password
3. Credentials are saved securely to Firestore (never in code!)

### Step 3: Add Teachers & Students
1. Login at `staff-login.html` with your management credentials
2. Add teachers via "Teachers" tab
3. Scan ID cards or bulk import students
4. Students login at `student-login.html`

## Alternative: MySQL + PHP

### Step 1: Import Database
- phpMyAdmin → Import `api/database-schema.sql`

### Step 2: Configure
- Copy `api/db-config.example.php` to `api/db-config.php`
- Set your MySQL credentials (NEVER commit db-config.php!)

### Step 3: Set Environment Variables
On your server, set these environment variables or edit the PHP files:
- `SKPPS_MGMT_CODE` - Management security code
- `SKPPS_MGMT_HASH` - bcrypt hash of management password  
  (Generate: `php -r "echo password_hash('yourpassword', PASSWORD_BCRYPT);"`)
- `DB_USER`, `DB_PASS`, `DB_NAME` - MySQL credentials

## Security Notes
- NEVER commit real credentials to GitHub
- `firebase/firebase-config.js` and `api/db-config.php` are in `.gitignore`
- Use `firebase-setup.html` for Firebase config (stored in browser localStorage)
- Use environment variables for PHP credentials
- Rotate passwords regularly
