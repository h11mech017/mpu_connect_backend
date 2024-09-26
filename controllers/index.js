import { AdminController } from "./AdminController.js";
import { ParkingController } from "./ParkingController.js";
import { UserController } from "./UserController.js";

export function createControllers(services) {
  return {
    userController: new UserController(services.userService),
    adminController: new AdminController(services.adminService),
    parkingController: new ParkingController(services.parkingService),
  };
}