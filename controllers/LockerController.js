export class LockerController {
    constructor(lockerService) {
        this.lockerService = lockerService;
    }

    async getUserLocker(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            res.status(401).send("Unauthorized");
        }

        try {
            const lockerData = await this.lockerService.getUserLocker(token);
            return res.status(200).send(lockerData);
        } catch (error) {
            console.error("Error in getUserLocker:", error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async applyForLocker(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            res.status(401).send("Unauthorized");
        }

        try {
            const lockerData = await this.lockerService.applyForLocker(token);
            return res.status(200).send(lockerData);
        } catch (error) {
            console.error("Error in applyForLocker:", error);
            return res.status(500).send("Internal Server Error");
        }
    }
}