import UserService from "../services/UserService.js";

export class UserController {
  static async getUserProfile(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).send("Unauthorized");
    }

    const userProfile = await UserService.getUserProfile(token);

    return res.status(200).send(userProfile);
  }
}
