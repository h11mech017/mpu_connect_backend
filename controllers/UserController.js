export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getUserProfile(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1]

    if (!token) {
      res.status(401).send("Unauthorized")
    }
    try {
      const userProfile = await this.userService.getUserProfile(token)
      return res.status(200).json(userProfile)
    } catch (error) {
      console.error("Error in getUserProfile:", error)
      return res.status(500).send("Internal Server Error")
    }
  }

  async getUserRole(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1]

    if (!token) {
      res.status(401).send("Unauthorized")
    }
    try {
      const userRole = await this.userService.getUserRole(token)
      return res.status(200).json(userRole)
    } catch (error) {
      console.error("Error in getUserRole:", error)
      return res.status(500).send("Internal Server Error")
    }
  }

  async getUserAnnouncements(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1]

    if (!token) {
      res.status(401).send("Unauthorized")
    }
    try {
      const userAnnouncements = await this.userService.getUserAnnouncements(token)
      return res.status(200).json(userAnnouncements)
    } catch (error) {
      console.error("Error in getUserAnnouncements:", error)
      return res.status(500).send("Internal Server Error")
    }
  }

  async getUserAssignments(req, res) {
    const token = req.headers.authorization?.split("Bearer ")[1]

    if (!token) {
      res.status(401).send("Unauthorized")
    }
    try {
      const userAssignments = await this.userService.getUserAssignments(token)
      return res.status(200).json(userAssignments)
    } catch (error) {
      console.error("Error in getUserAssignments:", error)
      return res.status(500).send("Internal Server Error")
    }
  }
}
