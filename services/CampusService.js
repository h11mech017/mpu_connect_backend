import { AdminService } from "./AdminService.js"

export class CampusService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin
        this.AdminService = new AdminService(firebaseAdmin)
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
            const role = await this.AdminService.checkAdmin(token)
            let rootPrefix = `events/`

            let eventRefs = null
            let eventQuery = null

            // For debugging, let's go back to the original approach but with better logging
            const currentDate = new Date()

            if (role === true) {
                // Admin users can see all non-deleted events
                eventRefs = this.admin.firestore().collection("events").where("is Deleted", "==", false)
                eventQuery = eventRefs.orderBy("Post Date", "desc").limit(pageSize).offset((page - 1) * pageSize)
            } else {
                // Non-admin users should only see events with visible date <= current date
                eventRefs = this.admin.firestore().collection("events").where("is Deleted", "==", false)
                eventQuery = eventRefs.orderBy("Post Date", "desc").limit(pageSize).offset((page - 1) * pageSize)
            }


            const eventData = await eventQuery.get().then(async (querySnapshot) => {
                const eventPromises = querySnapshot.docs.map(async (doc) => {
                    rootPrefix = `events/${doc.id}/`

                    const [files] = await bucket.getFiles({ prefix: rootPrefix })

                    if (!Array.isArray(files)) {
                        console.error('Unexpected response from getFiles:', files)
                        throw new Error('Unexpected response from storage')
                    }

                    let allFiles = await Promise.all(files.map(async (file) => {
                        if (file.name.endsWith('/')) {
                            return null
                        }

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
                        'Images': allFiles
                    }
                })

                const events = await Promise.all(eventPromises)

                // Filter events based on Visible Date for non-admin users
                if (role !== true) {

                    return events.filter(event => {
                        const visibleDate = event['Visible Date']

                        // If no visible date, show the event
                        if (!visibleDate) return true

                        // Convert Firestore timestamp to JavaScript Date
                        let visibleDateTime
                        if (visibleDate._seconds) {
                            // Handle Firestore timestamp format
                            visibleDateTime = new Date(visibleDate._seconds * 1000)
                        } else if (visibleDate.seconds) {
                            // Handle alternative Firestore timestamp format
                            visibleDateTime = new Date(visibleDate.seconds * 1000)
                        } else if (visibleDate.toDate) {
                            // Handle Firestore Timestamp object
                            visibleDateTime = visibleDate.toDate()
                        } else {
                            // Try to parse as date if it's a string
                            visibleDateTime = new Date(visibleDate)
                        }

                        return visibleDateTime <= currentDate
                    })
                }

                return events
            })

            return eventData
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async addCampusEvent(token, eventData, files) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()

            if (!this.AdminService.checkAdmin(token)) {
                throw new Error('Unauthorized')
            }

            eventData = JSON.parse(eventData)

            if (eventData['is Notification'] === undefined) {
                eventData['is Notification'] = false
            }

            const eventRef = this.admin.firestore().collection("events")
            const newEvent = await eventRef.add({
                'Headline': eventData['Headline'],
                'Event Start Date': eventData['Event Start Date'],
                'Event End Date': eventData['Event End Date'],
                'Visible Date': eventData['Visible Date'],
                'Details': eventData['Details'],
                'Post Date': new Date(),
                'Created By': uid,
                'is Deleted': false,
                'is Notification': eventData['is Notification'],
            })

            const eventId = newEvent.id
            const rootPrefix = `events/${eventId}/`

            for (const file of files) {
                const fileName = `${rootPrefix}${file.originalname}`
                const fileUpload = bucket.file(fileName)

                const stream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                })

                stream.on('error', (error) => {
                    console.error('Error uploading file:', error)
                    throw error
                })

                stream.on('finish', () => {
                    console.log('File uploaded successfully')
                })

                stream.end(file.buffer)
            }

            return true
        } catch (error) {
            console.error('Error adding event:', error)
            throw error
        }
    }

    async updateCampusEvent(token, eventData, files) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()

            if (!this.AdminService.checkAdmin(token)) {
                throw new Error('Unauthorized')
            }

            eventData = JSON.parse(eventData)

            const eventId = eventData['id']

            const eventRef = this.admin.firestore().collection("events").doc(eventId)
            await eventRef.update({
                'Headline': eventData['Headline'],
                'Details': eventData['Details'],
                'Event Start Date': eventData['Event Start Date'],
                'Event End Date': eventData['Event End Date'],
                'Visible Date': eventData['Visible Date'],
                'is Notification': eventData['is Notification'],
            })

            const rootPrefix = `events/${eventId}/`

            for (const file of files) {
                const fileName = `${rootPrefix}${file.originalname}`
                const fileUpload = bucket.file(fileName)

                const stream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                })

                stream.on('error', (error) => {
                    console.error('Error uploading file:', error)
                    throw error
                })

                stream.on('finish', () => {
                    console.log('File uploaded successfully')
                })

                stream.end(file.buffer)
            }

            return true
        } catch (error) {
            console.error('Error adding event:', error)
            throw error
        }
    }

    async deleteCampusEvent(token, eventId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid

            if (!this.AdminService.checkAdmin(token)) {
                throw new Error('Unauthorized')
            }

            const eventRef = this.admin.firestore().collection("events").doc(eventId)
            await eventRef.update({
                'is Deleted': true,
            })

            return true
        } catch (error) {
            console.error('Error deleting event:', error)
            throw error
        }
    }

}
