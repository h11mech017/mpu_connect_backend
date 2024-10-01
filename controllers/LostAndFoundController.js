export class LostAndFoundController {
    constructor(lostAndFoundService) {
        this.lostAndFoundService = lostAndFoundService;
    }

    async getLostItems(req, res) {
        try {
            const lostItems = await this.lostAndFoundService.getLostItems();
            return res.status(200).send(lostItems);
        } catch (error) {
            console.error("Error getting lost items:", error);
            return res.status(500).send("Internal Server Error");
        }
    }
}