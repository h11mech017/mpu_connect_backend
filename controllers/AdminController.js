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
                return res.status(403).send("Forbidden");
            }

            const applications = await this.adminService.getParkingApplications();
            return res.status(200).send(applications);
        } catch (error) {
            console.error("Error in getParkingApplications:", error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async updateParkingApplicationStatus(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];
        const { id, data } = req.body;

        if (!token) {
            res.status(401).send("Unauthorized");
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token);
            if (!isAdmin) {
                return res.status(403).send("Forbidden");
            }

            const updated = await this.adminService.updateParkingApplicationStatus(id, data);
            if (updated) {
                return res.status(200).send("Updated");
            } else {
                return res.status(500).send("Internal Server Error");
            }
        } catch (error) {
            console.error("Error in updateParkingApplicationStatus:", error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async addLostItem(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1];

            const isAdmin = await this.adminService.checkAdmin(token);
            if (!isAdmin) {
                return res.status(403).send("Forbidden");
            }

            const form = req.body;
            await this.adminService.addLostItem(token, form);
            return res.status(200).send("Lost item added successfully");
        } catch (error) {
            console.error("Error adding lost item:", error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async claimLostItem(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];
        const { id, data } = req.body;

        if (!token) {
            res.status(401).send("Unauthorized");
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token);
            if (!isAdmin) {
                return res.status(403).send("Forbidden");
            }

            const claimed = await this.adminService.claimLostItem(id, data)
            if (claimed) {
                return res.status(200).send("Item Claimed");
            } else {
                return res.status(500).send("Internal Server Error");
            }
        } catch (error) {
            console.error("Error in updateParkingApplicationStatus:", error);
            return res.status(500).send("Internal Server Error");
        }
    }
}