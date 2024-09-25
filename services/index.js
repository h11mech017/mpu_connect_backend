import admin from "firebase-admin";
import { UserService } from "./UserService.js";
import { ParkingService } from "./ParkingService.js";

export function createServices() {
    return {
      userService: new UserService(admin),
      parkingService: new ParkingService(admin),
    };
  }

