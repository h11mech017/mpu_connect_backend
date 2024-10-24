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
            return res.status(200).json(lockerData);
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
            const isApplied = await this.lockerService.applyForLocker(token);
            if (!isApplied) {
                return res.status(400).send("There is no available locker for your faculty");
            }
            return res.status(200).json(isApplied);
        } catch (error) {
            console.error("Error in applyForLocker:", error);
            return res.status(500).send("Internal Server Error");
        }
    }
}