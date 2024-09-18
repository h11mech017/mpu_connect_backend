import admin from "firebase-admin";
import { UserService } from "./UserService.js";

export function createServices() {
    return {
      userService: new UserService(admin),
    };
  }

