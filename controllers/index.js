import { UserController } from "./UserController.js";

export function createControllers(services) {
  return {
    userController: new UserController(services.userService),
  };
}