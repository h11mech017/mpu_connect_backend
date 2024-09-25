import admin from "firebase-admin";
import { UserService } from "./UserService.js";
import { ParkingService } from "./ParkingService.js";
import { AdminService } from "./AdminService.js";

export function createServices() {
    return {
      userService: new UserService(admin),
      AdminService: new AdminService(admin),
      parkingService: new ParkingService(admin),
    };
  }

