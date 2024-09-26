export class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }

    async checkAdmin(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            res.status(401).send("Unauthorized");
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token);
            return res.status(200).send({ isAdmin });
        } catch (error) {
            console.error("Error in checkAdmin:", error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async getParkingApplications(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            res.status(401).send("Unauthorized");
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token);
            if (!isAdmin) {
                return res.status(401).send("Unauthorized");
            }

            const applications = await this.adminService.getParkingApplications();
            return res.status(200).send(applications);
        } catch (error) {
            console.error("Error in getParkingApplications:", error);
            return res.status(500).send("Internal Server Error");
        }
    }
}