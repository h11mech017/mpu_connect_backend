export class CampusController {
    constructor(campusService) {
        this.campusService = campusService
    }

    async getBusSchedules(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            const schedules = await this.campusService.getBusSchedules(token)

            res.status(200).send(schedules)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async getCanteenMenus(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            const menus = await this.campusService.getCanteenMenus(token)

            res.status(200).send(menus)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async getCampusEvents(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            let page
            if (req.query.page) {
                page = parseInt(req.query.page, 10)
            }
            let pageSize
            if (req.query.pageSize) {
                pageSize = parseInt(req.query.pageSize, 10)
            }
            const events = await this.campusService.getCampusEvents(token, page, pageSize)

            res.status(200).send(events)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async addCampusEvent(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            const eventData = req.body.formData
            const files = req.files

            if (!token) {
                res.status(401).send("Unauthorized")
            }

            const result = await this.campusService.addCampusEvent(token, eventData, files)

            if (result) {
                res.status(200).send("Event added successfully")
            }
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async updateCampusEvent(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const eventData = req.body.formData
        const files = req.files

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.campusService.updateCampusEvent(token, eventData, files)
            
            if (result) {
                res.status(200).json({ message: "Event updated successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async deleteCampusEvent(req, res) {
        const token = req.headers.authorization?.split("Bearer ")[1]
        const eventId = req.params.eventId

        if (!token) {
            res.status(401).send("Unauthorized")
        }

        try {
            const result = await this.campusService.deleteCampusEvent(token, eventId)

            if (result) {
                res.status(200).json({ message: "Event deleted successfully" })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}
