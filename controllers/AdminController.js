export class AdminController {
    constructor(adminService) {
        this.adminService = adminService
    }

    async checkAdmin(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]

        if (!token) {
            res.status(401).send("Unauthorized")
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token)
            res.status(200).send({ isAdmin })
        } catch (error) {
            console.error("Error in checkAdmin:", error)
            res.status(500).send("Internal Server Error")
        }
    }

    async checkRole(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]

        if (!token) {
            res.status(401).send("Unauthorized")
        }
        try {
            const isValid = await this.adminService.checkRole(token)
            res.status(200).send({ isValid })
        } catch (error) {
            console.error("Error in checkRole:", error)
            res.status(500).send("Internal Server Error")
        }
    }

    async getParkingApplications(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]

        if (!token) {
            res.status(401).send("Unauthorized")
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token)
            if (!isAdmin) {
                res.status(403).send("Forbidden")
            }

            const applications = await this.adminService.getParkingApplications()
            res.status(200).send(applications)
        } catch (error) {
            console.error("Error in getParkingApplications:", error)
            res.status(500).send("Internal Server Error")
        }
    }

    async updateParkingApplicationStatus(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        console.log(req.body)
        const { id, data } = req.body

        if (!token) {
            res.status(401).send("Unauthorized")
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token)
            if (!isAdmin) {
                res.status(403).send("Forbidden")
            }

            const updated = await this.adminService.updateParkingApplicationStatus(id, data)
            console.log(updated)
            if (updated) {
                res.status(200).send("Updated")
            } else {
                res.status(500).send("Internal Server Error")
            }
        } catch (error) {
            console.error("Error in updateParkingApplicationStatus:", error)
            res.status(500).send("Internal Server Error")
        }
    }

    async addLostItem(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            const form = req.body

            const isAdmin = await this.adminService.checkAdmin(token)
            if (!isAdmin) {
                res.status(403).send("Forbidden")
            }

            await this.adminService.addLostItem(token, form)
            res.status(200).send("Lost item added successfully")
        } catch (error) {
            console.error("Error adding lost item:", error)
            res.status(500).send("Internal Server Error")
        }
    }

    async claimLostItem(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const { id, data } = req.body

        if (!token) {
            res.status(401).send("Unauthorized")
        }
        try {
            const isAdmin = await this.adminService.checkAdmin(token)
            if (!isAdmin) {
                res.status(403).send("Forbidden")
            }

            const claimed = await this.adminService.claimLostItem(id, data)
            if (claimed) {
                res.status(200).send("Item Claimed")
            } else {
                res.status(500).send("Internal Server Error")
            }
        } catch (error) {
            console.error("Error in claimLostItem:", error)
            res.status(500).send("Internal Server Error")
        }
    }
}