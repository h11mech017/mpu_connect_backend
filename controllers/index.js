import { AdminController } from "./AdminController.js"
import { LockerController } from "./LockerController.js"
import { LostAndFoundController } from "./LostAndFoundController.js"
import { ParkingController } from "./ParkingController.js"
import { UserController } from "./UserController.js"
import { EmailController } from "./EmailController.js"
import { CourseController } from "./CourseController.js"
import { CampusController } from "./CampusController.js"

export function createControllers(services) {
  return {
    userController: new UserController(services.userService),
    adminController: new AdminController(services.adminService),
    parkingController: new ParkingController(services.parkingService),
    lockerController: new LockerController(services.lockerService),
    lostAndFoundController: new LostAndFoundController(services.lostAndFoundService),
    emailController: new EmailController(services.emailService),
    courseController: new CourseController(services.courseService),
    campusController: new CampusController(services.campusService),
  };
}