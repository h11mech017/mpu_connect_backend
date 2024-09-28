import admin from "firebase-admin";
import { UserService } from "./UService.js";
import { ParkingService } from "./ParkingService.js";
import { AdminService } from "./AdminService.js";
import { LockerService } from "./LockerService.js";

export function createServices() {
    return {
      userService: new UserService(admin),
      adminService: new AdminService(admin),
      parkingService: new ParkingService(admin),
      lockerService: new LockerService(admin),
    };
  }

