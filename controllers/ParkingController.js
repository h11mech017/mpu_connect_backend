export class ParkingController {
    constructor(parkingService) {
        this.parkingService = parkingService;
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