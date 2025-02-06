export class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
    }

    async getUserCourses(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const courses = await this.courseService.getUserCourses(token)
            res.status(200).json(courses)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async addCourseAnnouncement(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const announcementData = req.body

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.addCourseAnnouncement(token, courseId, announcementData)

            if (result) {
                res.status(200).json({ message: "Announcement added successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getCourseAnnouncements(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const announcements = await this.courseService.getCourseAnnouncements(token, courseId)
            res.status(200).json(announcements)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async updateCourseAnnouncement(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const announcementId = req.body.id
        const announcementData = req.body.data

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.updateCourseAnnouncement(token, announcementId, announcementData)

            if (result) {
                res.status(200).json({ message: "Announcement updated successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async deleteCourseAnnouncement(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const announcementId = req.params.announcementId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.deleteCourseAnnouncement(token, announcementId)

            if (result) {
                res.status(200).json({ message: "Announcement deleted successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getHolidays(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const academicYear = req.params.academicYear

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const holidays = await this.courseService.getHolidays(token, academicYear)
            res.status(200).json(holidays)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getCourseSchedule(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const schedule = await this.courseService.getCourseSchedule(token, courseId)
            res.status(200).json(schedule)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getCourseFiles(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const files = await this.courseService.getCourseFiles(token, courseId)
            res.status(200).json(files)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async deleteCourseFile(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const filepath = req.headers.filepath

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.deleteCourseFile(token, courseId, filepath)

            if (result) {
                res.status(200).json({ message: "File deleted successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async addCourseAssignment(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const assignmentData = req.body.formData
        const files = req.files

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.addCourseAssignment(token, courseId, assignmentData, files)
            if (result) {
                res.status(200).json({ message: "Assignment added successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async deleteCourseAssignment(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const assignmentId = req.params.assignmentId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.deleteCourseAssignment(token, courseId, assignmentId)

            if (result) {
                res.status(200).json({ message: "Assignment deleted successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getCourseAssignments(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const assignments = await this.courseService.getCourseAssignments(token, courseId);
            res.status(200).json(assignments)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getCourseAssignmentFiles(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const assignmentId = req.params.assignmentId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const files = await this.courseService.getCourseAssignmentFiles(token, courseId, assignmentId)
            res.status(200).json(files)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getAssignmentSubmissions(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const section = req.params.section
        const assignmentId = req.params.assignmentId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const submissions = await this.courseService.getAssignmentSubmissions(token, courseId, section, assignmentId)
            res.status(200).json(submissions)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getUserAssignmentGrades(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const section = req.params.section

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const grades = await this.courseService.getUserAssignmentGrades(token, courseId, section)
            res.status(200).json(grades)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async updateCourseAssignment(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const assignmentId = req.params.assignmentId
        const assignmentData = req.body.formData
        const files = req.files

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.updateCourseAssignment(token, courseId, assignmentId, assignmentData, files)
            
            if (result) {
                res.status(200).json({ message: "Assignment updated successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async submitAssignment(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const assignmentId = req.params.assignmentId
        const file = req.file

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.submitAssignment(token, courseId, assignmentId, file)

            if (result) {
                res.status(200).json({ message: "Assignment submitted successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async gradeAssignment(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const submissionId = req.body.id
        const score = req.body.data.Score
        const feedback = req.body.data.Feedback

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.gradeAssignment(token, submissionId, score, feedback)

            if (result) {

                res.status(200).json({ message: "Assignment graded successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async uploadCourseFile(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const path = req.body.directory
        const file = req.file

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.uploadCourseFile(token, courseId, path, file)

            if (result) {
                res.status(200).json(result)
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getCourseAttendances(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const section = req.params.section

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const attendances = await this.courseService.getCourseAttendances(token, courseId, section)
            res.status(200).json(attendances)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async getAttendanceDetail(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const attendanceId = req.params.attendanceId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const attendance = await this.courseService.getAttendanceDetail(token, attendanceId)
            res.status(200).json(attendance)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async addCourseAttendance(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const section = req.params.section

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.addCourseAttendance(token, courseId, section)

            if (result) {
                res.status(200).json(result)
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async takeAttendanceTeacher(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const attendanceId = req.params.attendanceId
        const studentUid = req.body.id
        const status = req.body.data

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.takeAttendanceTeacher(token, attendanceId, studentUid, status)

            if (result) {
                res.status(200).json({ message: "Attendance taken successfully" })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ meassage: "Failed to take attendance" })
        }
    }

    async studentCheckIn(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const courseId = req.params.courseId
        const section = req.params.section
        const attendanceId = req.params.attendanceId
        const hash = req.query.hash
        const timestamp = req.query.timestamp

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.courseService.studentCheckIn(token, courseId, section, attendanceId, hash, timestamp)

            if (result) {
                res.status(200).json({ message: "Check in successful" })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Failed to check in" })
        }
    }


}