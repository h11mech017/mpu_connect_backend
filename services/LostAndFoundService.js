export class LostAndFoundService {
    constructor(admin) {
        this.admin = admin;
    }

    async getLostItems() {
        try {
            const lostItemsRef = await this.admin.firestore().collection('lost and found')
            const lostItemsData = await lostItemsRef.get().then((querySnapshot) => {
                const lostItems = [];
                querySnapshot.forEach((doc) => {
                    lostItems.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                return lostItems
            })
            return lostItemsData
        } catch (error) {
            throw new Error(error.message);
        }
    }
}