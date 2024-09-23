export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async checkAdmin(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).send("Unauthorized");
    }
    try {
      const isAdmin = await this.userService.adminCheck(token);
      return res.status(200).send({ isAdmin });
    } catch (error) {
      console.error("Error in checkAdmin:", error);
      return res.status(500).send("Internal Server Error");
    }
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

  async getUserQrCode(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(40a).send("Unauthorized");
    }
    try {
      const qrCodeUrl = await this.userService.getUserQrCode(token);
      return res.status(200).send(qrCodeUrl);
    } catch (error) {
      console.error("Error in getUserQrCode:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
}
