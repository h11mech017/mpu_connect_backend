# MPU Connect Backend

A comprehensive Node.js backend server for the MPU Connect application, providing APIs for student, faculty, and campus management at Macau Polytechnic University.

## Overview

MPU Connect Backend serves as the central API server for the MPU Connect ecosystem, handling data management, authentication, and integration with various university services. The system is built with Express.js and Firebase/Firestore, offering secure and efficient API endpoints for mobile and web clients.

## Features

### User Management
- User profile retrieval
- Role-based access control
- Authentication via Firebase

### Course Management
- Course enrollment and information
- Course schedules with holiday awareness
- File sharing and management
- Student roster access

### Course Content
- **Announcements:** Create, read, update, and delete course announcements
- **Assignments:**
  - Assignment creation and submission
  - File uploads (supporting PDF, DOCX, ZIP, RAR formats)
  - Grading system
  - Submission tracking
- **Attendance:**
  - Attendance tracking for courses
  - Student check-in functionality
  - Detailed attendance records

### Email Integration
- Email login and session management
- Email retrieval and viewing
- Email detail access

### Campus Services
- **Shuttle Bus:** Schedule information
- **Canteen:** Menu information
- **Events:** Campus event management and notifications
- **Lockers:** Application and status tracking
- **Parking:** Application and status tracking
- **Lost and Found:** Item listing and claiming

### Administration
- Admin authentication and role verification
- Parking application management
- Lost item management

## Technical Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **File Storage:** Firebase Storage
- **Email Integration:** ImapFlow, MailParser
- **Scheduling:** Node-Schedule
- **File Handling:** Multer

## API Endpoints

### Admin Endpoints
- `GET /api/admin/check` - Verify admin status
- `GET /api/admin/role/check` - Check admin role permissions
- `GET /api/admin/parking/applications` - Get parking applications
- `PUT /api/admin/parking/application/update` - Update parking application status
- `POST /api/admin/lost/item/add` - Add lost item
- `PUT /api/admin/lost/item/claim` - Update lost item claim status

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `GET /api/user/role` - Get user role
- `GET /api/user/announcements` - Get user announcements
- `GET /api/user/assignments` - Get user assignments

### Parking Endpoints
- `GET /api/user/parking/status` - Get parking application status
- `POST /api/user/parking/apply` - Apply for parking

### Locker Endpoints
- `GET /api/user/locker/status` - Get user locker status
- `POST /api/user/locker/apply` - Apply for locker
- `GET /api/lockers` - Get available lockers

### Lost and Found Endpoints
- `GET /api/lost/items` - Get lost items
- `GET /api/lost/categories` - Get lost item categories
- `GET /api/lost/locations` - Get lost item locations

### Email Endpoints
- `POST /api/user/emails/login` - Login to email
- `GET /api/user/emails/:sessionId/latest` - Get latest email
- `GET /api/user/emails/:sessionId` - Get emails
- `GET /api/user/emails/:sessionId/:seq` - Get email detail
- `POST /api/user/emails/:sessionId/logout` - Logout from email

### Course Endpoints
- `GET /api/user/courses` - Get user courses
- `GET /api/user/courses/:courseId/:section/students` - Get enrolled students

### Course Announcement Endpoints
- `GET /api/user/courses/:courseId/announcements` - Get course announcements
- `POST /api/user/courses/:courseId/announcements/add` - Add course announcement
- `PUT /api/user/courses/:courseId/announcements/:announcementId/update` - Update course announcement
- `PUT /api/user/courses/:courseId/announcements/:announcementId/delete` - Delete course announcement

### Course Schedule Endpoints
- `GET /api/user/courses/holidays/:academicYear` - Get holidays for academic year
- `GET /api/user/courses/:courseId/schedule` - Get course schedule

### File Endpoints
- `GET /api/user/courses/:courseId/files` - Get course files
- `DELETE /api/user/courses/:courseId/files/delete` - Delete course file
- `POST /api/user/courses/:courseId/files/upload` - Upload course file

### Assignment Endpoints
- `GET /api/user/courses/:courseId/assignments` - Get course assignments
- `POST /api/user/courses/:courseId/assignments/add` - Add course assignment
- `GET /api/user/courses/:courseId/:section/grades` - Get user assignment grades
- `POST /api/user/courses/:courseId/assignments/:assignmentId/update` - Update course assignment
- `PUT /api/user/courses/:courseId/assignments/:assignmentId/delete` - Delete course assignment
- `GET /api/user/courses/:courseId/assignments/:assignmentId/files` - Get course assignment files
- `GET /api/user/courses/:courseId/:section/assignments/:assignmentId/submissions` - Get assignment submissions
- `PUT /api/user/courses/:courseId/assignments/:assignmentId/submissions/grading` - Grade assignment
- `POST /api/user/courses/:courseId/assignments/:assignmentId/submit` - Submit assignment

### Attendance Endpoints
- `GET /api/user/courses/:courseId/:section/attendance` - Get course attendances
- `GET /api/user/courses/:courseId/:section/attendance/:attendanceId` - Get attendance detail
- `POST /api/user/courses/:courseId/:section/attendance/add` - Add course attendance
- `PUT /api/user/courses/:courseId/:section/attendance/:attendanceId/update` - Take attendance (teacher)
- `GET /api/user/courses/:courseId/:section/attendance/:attendanceId/checkin` - Student check-in

### Campus Endpoints
- `GET /api/campus/shuttle/schedule` - Get bus schedules
- `GET /api/campus/canteen/menu` - Get canteen menus
- `GET /api/campus/events` - Get campus events
- `POST /api/campus/events/add` - Add campus event
- `POST /api/campus/events/:eventId/update` - Update campus event
- `PUT /api/campus/events/:eventId/delete` - Delete campus event

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure Firebase:
   - Create a `.env` file with your Firebase credentials
   - Required environment variables:
     - FIREBASE_PROJECT_ID
     - FIREBASE_PRIVATE_KEY_ID
     - FIREBASE_PRIVATE_KEY
     - FIREBASE_CLIENT_EMAIL
     - FIREBASE_CLIENT_ID
     - FIREBASE_AUTH_URI
     - FIREBASE_TOKEN_URI
     - FIREBASE_AUTH_PROVIDER_X509_CERT_URL
     - FIREBASE_CLIENT_X509_CERT_URL
     - FIREBASE_STORAGE_BUCKET

4. Run the server:
   ```
   node server.js
   ```

## License

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License - see the [LICENSE](LICENSE) file for details.

This license allows others to view, share, and adapt the work for non-commercial purposes, as long as they give appropriate credit to the original author. Commercial use is explicitly prohibited.

This is ideal for portfolio projects where you want to showcase your work while preventing commercial exploitation.
