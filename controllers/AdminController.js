export class AdminController {
    constructor(services) {
        this.adminService = services.adminService;
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
}