export class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
    }

    // async getCourse(req, res) {
    //     try {
    //         const course = await this.courseService.getCourse(req.params.id);
    //         res.status(200).json(course);
    //     } catch (error) {
    //         res.status(500).json({ error: error.message });
    //     }
    // }

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
            res.status(200).json({ message: "Assignment submitted successfully" })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }


}