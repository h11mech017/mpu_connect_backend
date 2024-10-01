import admin from "firebase-admin";
import { UserService } from "./UserService.js";
import { ParkingService } from "./ParkingService.js";
import { AdminService } from "./AdminService.js";
import { LockerService } from "./LockerService.js";
import { LostAndFoundService } from "./LostAndFoundService.js";

export function createServices() {
    return {
      userService: new UserService(admin),
      adminService: new AdminService(admin),
      parkingService: new ParkingService(admin),
      lockerService: new LockerService(admin),
      lostAndFoundService: new LostAndFoundService(admin),
    };
  }

