export class LostAndFoundController {
    constructor(lostAndFoundService) {
        this.lostAndFoundService = lostAndFoundService;
    }

    async getCategories(req, res) {
        try {
            const categoriesAndLocations = await this.lostAndFoundService.getCategories();
            return res.status(200).json(categoriesAndLocations);
        } catch (error) {
            console.error("Error getting categories:", error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async getLocations(req, res) {
        try {
            const categoriesAndLocations = await this.lostAndFoundService.getLocations();
            return res.status(200).json(categoriesAndLocations);
        } catch (error) {
            console.error("Error getting locations:", error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async getLostItems(req, res) {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1]

            const page = parseInt(req.query.page, 1);
            const pageSize = parseInt(req.query.pageSize, 10);
            const lostItems = await this.lostAndFoundService.getLostItems(token, page, pageSize);
            return res.status(200).json(lostItems);
        } catch (error) {
            console.error("Error getting lost items:", error);
            return res.status(500).send("Internal Server Error");
        }
    }
}