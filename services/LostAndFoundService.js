export class LostAndFoundService {
    constructor(admin) {
        this.admin = admin;
    }

    async getCategories() {
        try {
            const categoriesRef = await this.admin.firestore().collection('categories')
            const categoriesData = await categoriesRef.get().then((querySnapshot) => {
                const categories = [];
                querySnapshot.forEach((doc) => {
                    categories.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                return categories
            })

            return categoriesData
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getLocations() {
        try {
            const locationsRef = await this.admin.firestore().collection('locations')
            const locationsData = await locationsRef.get().then((querySnapshot) => {
                const locations = [];
                querySnapshot.forEach((doc) => {
                    locations.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                return locations
            })

            return locationsData
        } catch (error) {
            throw new Error(error.message);
        }
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