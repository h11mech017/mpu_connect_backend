import express from "express";
import { createServices } from "../services/index.js";
import { createControllers } from "../controllers/index.js";

export function setupRoutes() {
    const router = express.Router();
    const services = createServices();
    const controllers = createControllers(services);

    //Admin routes
    router.get("/admin/check", (req, res) => controllers.adminController.checkAdmin(req, res));
    router.get("/admin/parking/applications", (req, res) => controllers.adminController.getParkingApplications(req, res));
    router.put("/admin/parking/application/update", (req, res) => controllers.adminController.updateParkingApplicationStatus(req, res));

    //User routes
    router.get("/user/profile", (req, res) => controllers.userController.getUserProfile(req, res));
    router.get("/user/qr-code", (req, res) => controllers.userController.getUserQrCode(req, res));
    router.get("/user/faculty", (req, res) => controllers.userController.getUserFaculty(req, res));
    router.get("/user/parking/status", (req, res) => controllers.parkingController.getApplication(req, res));
    router.post("/user/parking/apply", (req, res) => controllers.parkingController.applyForParking(req, res));
    
    return router;
}