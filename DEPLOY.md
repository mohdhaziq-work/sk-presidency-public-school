# SKPPS Website - Deployment Guide

## Where Data is Stored

| Environment | Storage |
|-------------|---------|
| **GitHub Pages (demo)** | Browser localStorage (not shared) |
| **skpresidency.com (production)** | MySQL Database (all users share) |

## Step 1: Setup MySQL Database

1. Login to your hosting cPanel → phpMyAdmin
2. Click "New" → Database name: `skpps_students` → Create
3. Select `skpps_students` → Click "SQL" tab
4. Paste contents of `api/database-schema.sql` → Click "Go"
5. 7 tables created with 1 admin user

## Step 2: Update Database Credentials

Edit `api/db-config.php`:
```
DB_HOST → 'localhost' (usually correct)
DB_NAME → 'skpps_students'
DB_USER → your cPanel MySQL username
DB_PASS → your cPanel MySQL password
```

## Step 3: Upload All Files

Upload everything to `public_html/` or `www/` on skpresidency.com via FTP or cPanel File Manager.

## Step 4: Access

- **Website**: https://skpresidency.com
- **Staff Login**: https://skpresidency.com/staff-login.html
  - Management: Code `SKPPS@2024#ADMIN` / Pass `skpps#admin2024`
- **Student Login**: https://skpresidency.com/student-login.html

## How Data Flows

```
Management Panel → api/save-student.php → MySQL students table
Management Panel → api/save-teacher.php → MySQL admin_users table
Student Login → api/auth-student.php → MySQL students table
Teacher Login → api/auth-teacher.php → MySQL admin_users table
```

## PHP APIs (all in api/ folder)

| API | Purpose |
|-----|---------|
| db-config.php | Database connection |
| save-student.php | Add student to MySQL |
| list-students.php | Get all students |
| save-teacher.php | Add teacher to MySQL |
| list-teachers.php | Get all teachers |
| auth-student.php | Student login |
| auth-teacher.php | Teacher login |
| auth-management.php | Management login |
