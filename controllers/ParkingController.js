export class ParkingController {
    constructor(parkingService) {
        this.parkingService = parkingService;
    }

    async getParkingApplication(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];
    
        if (!token) {
        res.status(401).send("Unauthorized");
        }

        try {
        const application = await this.parkingService.getParkingApplication(token);
        if (!application) {
            return res.status(404).send("No application found");
        }
        return res.status(200).json(application);
        } catch (error) {
        console.error("Error getting application:", error);
        return res.status(500).send("Internal Server Error");
        }
    }

    async applyForParking(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1];
    
        if (!token) {
        res.status(401).send("Unauthorized");
        }

        const applyForm = req.body;

        try {
        await this.parkingService.applyForParking(token, applyForm);
        return res.status(200).send("Application submitted successfully");
        } catch (error) {
        console.error("Error in applyForParking:", error);
        return res.status(500).send("Internal Server Error");
        }
    }
}