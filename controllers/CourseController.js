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
        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            res.status(401).send("Unauthorized");
        }

        try {
            const courses = await this.courseService.getUserCourses(token);
            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


}