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


}
