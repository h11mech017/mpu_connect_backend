export class CampusController {
    constructor(campusService) {
        this.campusService = campusService;
    }

    async getBusSchedules(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            const schedules = await this.campusService.getBusSchedules(token);

            res.status(200).send(schedules);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getCanteenMenus(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            const menus = await this.campusService.getCanteenMenus(token);

            res.status(200).send(menus);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getCampusEvents(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]
            const page = req.query.page
            const pageSize = req.query.pageSize
            const events = await this.campusService.getCampusEvents(token, page, pageSize);

            res.status(200).send(events);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }


}
