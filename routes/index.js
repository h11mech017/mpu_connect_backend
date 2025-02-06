import express from "express"
import multer from "multer"
import { createServices } from "../services/index.js"
import { createControllers } from "../controllers/index.js"

export function setupRoutes() {
    const router = express.Router()
    const services = createServices()
    const controllers = createControllers(services)
    const upload = multer({ storage: multer.memoryStorage() })

    //Admin routes
    router.get("/admin/check", async (req, res) => controllers.adminController.checkAdmin(req, res))
    router.get("/admin/role/check", async (req, res) => controllers.adminController.checkRole(req, res))
    router.get("/admin/parking/applications", async (req, res) => controllers.adminController.getParkingApplications(req, res))
    router.put("/admin/parking/application/update", async (req, res) => controllers.adminController.updateParkingApplicationStatus(req, res))
    router.post("/admin/lost/item/add", async (req, res) => controllers.adminController.addLostItem(req, res))
    router.put("/admin/lost/item/claim", async (req, res) => controllers.adminController.claimLostItem(req, res))

    //User routes
    router.get("/user/profile", async (req, res) => controllers.userController.getUserProfile(req, res))
    router.get("/user/role", async (req, res) => controllers.userController.getUserRole(req, res))
    router.get("/user/courses/announcements", async (req, res) => controllers.userController.getUserAnnouncements(req, res))
    router.get("/user/assignments", async (req, res) => controllers.userController.getUserAssignments(req, res))

    //Parking routes
    router.get("/user/parking/status", async (req, res) => controllers.parkingController.getParkingApplication(req, res))
    router.post("/user/parking/apply", async (req, res) => controllers.parkingController.applyForParking(req, res))

    //Locker routes
    router.get("/user/locker/status", async (req, res) => controllers.lockerController.getUserLocker(req, res))
    router.post("/user/locker/apply", async (req, res) => controllers.lockerController.applyForLocker(req, res))

    //Lost and Found routes
    router.get("/lost/items", async (req, res) => controllers.lostAndFoundController.getLostItems(req, res))
    router.get("/lost/categories", async (req, res) => controllers.lostAndFoundController.getCategories(req, res))
    router.get("/lost/locations", async (req, res) => controllers.lostAndFoundController.getLocations(req, res))

    //Email routes
    router.post("/user/emails/login", async (req, res) => controllers.emailController.login(req, res))
    router.get("/user/emails/:sessionId/latest", async (req, res) => controllers.emailController.getLatestEmail(req, res))
    router.get("/user/emails/:sessionId", async (req, res) => controllers.emailController.getEmails(req, res))
    router.get("/user/emails/:sessionId/:seq", async (req, res) => controllers.emailController.getEmailDetail(req, res))
    router.post('/user/emails/:sessionId/logout', async (req, res) => controllers.emailController.logout(req, res))

    //Course routes
    router.get("/user/courses", async (req, res) => controllers.courseController.getUserCourses(req, res))

    //Course announcement routes
    router.get("/user/courses/:courseId/announcements", async (req, res) => controllers.courseController.getCourseAnnouncements(req, res))
    router.post("/user/courses/:courseId/announcements/add", async (req, res) => controllers.courseController.addCourseAnnouncement(req, res))
    router.put("/user/courses/:courseId/announcements/:announcementId/update", async (req, res) => controllers.courseController.updateCourseAnnouncement(req, res))
    router.put("/user/courses/:courseId/announcements/:announcementId/delete", async (req, res) => controllers.courseController.deleteCourseAnnouncement(req, res))

    //Course schedule routes
    router.get("/user/courses/holidays/:academicYear", async (req, res) => controllers.courseController.getHolidays(req, res))
    router.get("/user/courses/:courseId/schedule", async (req, res) => controllers.courseController.getCourseSchedule(req, res))

    //File routes
    router.get("/user/courses/:courseId/files", async (req, res) => controllers.courseController.getCourseFiles(req, res))
    router.delete("/user/courses/:courseId/files/delete", async (req, res) => controllers.courseController.deleteCourseFile(req, res))
    router.post("/user/courses/:courseId/files/upload", upload.single('file'), async (req, res) => controllers.courseController.uploadCourseFile(req, res))

    //Assignment routes
    router.get("/user/courses/:courseId/assignments", async (req, res) => controllers.courseController.getCourseAssignments(req, res))
    router.post("/user/courses/:courseId/assignments/add", upload.array('files'), async (req, res) => controllers.courseController.addCourseAssignment(req, res))
    router.get("/user/courses/:courseId/grades", async (req, res) => controllers.courseController.getUserAssignmentGrades(req, res))
    router.post("/user/courses/:courseId/assignments/:assignmentId/update", upload.array('files'), async (req, res) => controllers.courseController.updateCourseAssignment(req, res))
    router.put("/user/courses/:courseId/assignments/:assignmentId/delete", async (req, res) => controllers.courseController.deleteCourseAssignment(req, res))
    router.get("/user/courses/:courseId/assignments/:assignmentId/files", async (req, res) => controllers.courseController.getCourseAssignmentFiles(req, res))
    router.get("/user/courses/:courseId/:section/assignments/:assignmentId/submissions", async (req, res) => controllers.courseController.getAssignmentSubmissions(req, res))
    router.put("/user/courses/:courseId/assignments/:assignmentId/submissions/grading", async (req, res) => controllers.courseController.gradeAssignment(req, res))
    router.post("/user/courses/:courseId/assignments/:assignmentId/submit", upload.single('file'), async (req, res) => controllers.courseController.submitAssignment(req, res))

    //Attendance routes
    router.get("/user/courses/:courseId/:section/attendance", async (req, res) => controllers.courseController.getCourseAttendances(req, res))
    router.get("/user/courses/:courseId/:section/attendance/:attendanceId", async (req, res) => controllers.courseController.getAttendanceDetail(req, res))
    router.post("/user/courses/:courseId/:section/attendance/add", async (req, res) => controllers.courseController.addCourseAttendance(req, res))
    router.put("/user/courses/:courseId/:section/attendance/:attendanceId/update", async (req, res) => controllers.courseController.takeAttendanceTeacher(req, res))
    router.get("/user/courses/:courseId/:section/attendance/:attendanceId/checkin", async (req, res) => controllers.courseController.studentCheckIn(req, res))

    //Campus routes
    router.get("/campus/shuttle/schedule", async (req, res) => controllers.campusController.getBusSchedules(req, res))


    return router
}