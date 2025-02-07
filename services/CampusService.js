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

    async getCampusEvents(token, page = 1, pageSize = 10) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()
            let rootPrefix = `events/`

            const eventRefs = this.admin.firestore().collection("events")
            const eventQuery = eventRefs.orderBy("Post Date", "desc").limit(pageSize).offset((page - 1) * pageSize)


            const eventData = await eventQuery.get().then(async (querySnapshot) => {
                const eventPromises = querySnapshot.docs.map(async (doc) => {
                    rootPrefix = `events/${doc.id}/`
                    
                    const [files] = await bucket.getFiles({ prefix: rootPrefix })

                    if (!Array.isArray(files)) {
                        console.error('Unexpected response from getFiles:', files)
                        throw new Error('Unexpected response from storage')
                    }
        
                    let allFiles = await Promise.all(files.map(async (file) => {
                        file.fileName = file.name.replace(rootPrefix, '')
        
                        let downloadUrl = null
                        let metadata = null
                        if (!file.name.endsWith('/')) {
                            [downloadUrl] = await file.getSignedUrl({
                                action: 'read',
                                expires: Date.now() + 3600000 // 1 hour from now
                            });
        
                            [metadata] = await file.getMetadata()
                        }
                        return {
                            name: file.fileName,
                            path: file.name,
                            downloadUrl: downloadUrl,
                            contentType: metadata?.contentType,
                            size: metadata?.size ? parseInt(metadata.size, 10) : null,
                        }
                    }))
                    allFiles = allFiles.filter(file => file !== null && file.name !== '')
        
                    return {
                        id: doc.id,
                        ...doc.data(),
                        'images': allFiles
                    }
                })

                const events = await Promise.all(eventPromises)
                return events
            })

            return eventData
        } catch (error) {
            throw new Error(error.message)
        }
    }

}
