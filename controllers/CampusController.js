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


}
