import express from "express";
import { createServices } from "../services/index.js";
import { createControllers } from "../controllers/index.js";

export function setupRoutes() {
    const router = express.Router();
    const services = createServices();
    const controllers = createControllers(services);

    //User routes
    router.get("/user/profile", (req, res) => controllers.userController.getUserProfile(req, res));
    
    return router;
}