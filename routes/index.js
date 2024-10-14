import express from "express"
import { createServices } from "../services/index.js"
import { createControllers } from "../controllers/index.js"

export function setupRoutes() {
    const router = express.Router()
    const services = createServices()
    const controllers = createControllers(services)

    //Admin routes
    router.get("/admin/check", (req, res) => controllers.adminController.checkAdmin(req, res))
    router.get("/admin/parking/applications", (req, res) => controllers.adminController.getParkingApplications(req, res))
    router.put("/admin/parking/application/update", (req, res) => controllers.adminController.updateParkingApplicationStatus(req, res))
    router.post("/admin/lost/item/add", (req, res) => controllers.adminController.addLostItem(req, res))
    router.put("/admin/lost/item/claim", (req, res) => controllers.adminController.claimLostItem(req, res))

    //User routes
    router.get("/user/profile", (req, res) => controllers.userController.getUserProfile(req, res))

    //Parking routes
    router.get("/user/parking/status", (req, res) => controllers.parkingController.getParkingApplication(req, res))
    router.post("/user/parking/apply", (req, res) => controllers.parkingController.applyForParking(req, res))

    //Locker routes
    router.get("/user/locker/status", (req, res) => controllers.lockerController.getUserLocker(req, res))
    router.post("/user/locker/apply", (req, res) => controllers.lockerController.applyForLocker(req, res))

    //Lost and Found routes
    router.get("/lost/items", (req, res) => controllers.lostAndFoundController.getLostItems(req, res))
    router.get("/lost/categories", (req, res) => controllers.lostAndFoundController.getCategories(req, res))
    router.get("/lost/locations", (req, res) => controllers.lostAndFoundController.getLocations(req, res))

    //Email routes
    router.post("/user/emails/login", (req, res) => controllers.emailController.login(req, res))
    router.get("/user/emails/:sessionId/latest", (req, res) => controllers.emailController.getLatestEmail(req, res))
    router.get("/user/emails/:sessionId", (req, res) => controllers.emailController.getEmails(req, res))
    router.get("/user/emails/:sessionId/:seq", (req, res) => controllers.emailController.getEmailDetail(req, res))
    router.post('/user/emails/:sessionId/logout', (req, res) => controllers.emailController.logout(req, res))


    return router;
}