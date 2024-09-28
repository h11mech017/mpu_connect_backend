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

  async getUserQrCode(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).send("Unauthorized");
    }
    try {
      const qrCodeUrl = await this.userService.getUserQrCode(token);
      return res.status(200).send(qrCodeUrl);
    } catch (error) {
      console.error("Error in getUserQrCode:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async getUserFaculty(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).send("Unauthorized");
    }
    try {
      const userFaculty = await this.userService.getUserFaculty(token);
      return res.status(200).send(userFaculty);
    } catch (error) {
      console.error("Error in getUserFaculty:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
}
