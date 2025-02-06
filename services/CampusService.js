export class CampusService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin
    }

    async getBusSchedules(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid

            const scheduleRefs = this.admin.firestore().collection("campus shuttle")
            const scheduleData = await scheduleRefs.get().then((querySnapshot) => {
                const schedules = []
                querySnapshot.forEach((doc) => {
                    schedules.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                return schedules
            })
            return scheduleData
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getCanteenMenus(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid

            const menuRefs = this.admin.firestore().collection("canteen menus")
            const menuData = await menuRefs.get().then((querySnapshot) => {
                const menus = []
                querySnapshot.forEach((doc) => {
                    menus.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                return menus
            })
            return menuData
        } catch (error) {
            throw new Error(error.message)
        }
    }

}
