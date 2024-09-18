export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getUserProfile(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).send("Unauthorized");
    }
    try {
      const userProfile = await this.userService.getUserProfile(token);
      return res.status(200).send(userProfile);
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
}
