import { UserService } from "./UserService.js"
import crypto from 'crypto'
import { getMessaging } from "firebase-admin/messaging"
import schedule from 'node-schedule'

function firestoreTimestampToDate(timestamp) {
    if (timestamp && typeof timestamp._seconds === 'number' && typeof timestamp._nanoseconds === 'number') {
        return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
    }
    return null;
}

export class CourseService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin
        this.userService = new UserService(firebaseAdmin)
    }

    async getEnrolledStudents(token, courseId, section) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const studentRefs = this.admin.firestore().collection("student and course")
                .where('Course', '==', this.admin.firestore().collection('courses').doc(courseId))
                .where('Section', '==', section)
                .where('Enrolled', '==', true)

            const students = await studentRefs.get().then((querySnapshot) => {
                const studentPromises = []
                querySnapshot.forEach((doc) => {
                    const studentPromise = this.admin.firestore().collection('users').doc(doc.data()['Student']).get().then((studentDoc) => {
                        return {
                            'Student ID': studentDoc.data()['Student Info']['Student ID'],
                            'Name': studentDoc.data()['Student Info']['Name'],
                        }
                    })
                    studentPromises.push(studentPromise)
                })
                return Promise.all(studentPromises)
            })
            return students
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async getUserCourses(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid

            const userRole = await this.userService.getUserRole(token)

            let courseRefs = null
            if (userRole === 'Student') {
                courseRefs = await this.admin.firestore().collection("student and course")
                    .where('Student', '==', uid)
                    .where('Enrolled', '==', true)
            } else if (userRole === 'Teacher') {
                courseRefs = await this.admin.firestore().collection("teacher and course")
                    .where('Teacher', '==', uid)
                    .where('Teaching', '==', true)
            }

            const coursesData = await courseRefs.get().then(async (querySnapshot) => {
                const courses = []
                const coursePromises = []

                querySnapshot.forEach((doc) => {
                    const courseData = doc.data()
                    const coursePromise = courseData.Course.get().then(courseDoc => {
                        const { Student, ...restCourseData } = courseData
                        return {
                            id: courseDoc.id,
                            ...restCourseData,
                            Course: courseDoc.data()
                        };
                    })
                    coursePromises.push(coursePromise)
                })

                const resolvedCourses = await Promise.all(coursePromises)
                courses.push(...resolvedCourses)

                return courses
            })

            return coursesData
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getCourseAnnouncements(token, courseId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid


            const announcementRefs = this.admin.firestore().collection('course announcements')
                .where('Course', '==', courseId)
                .where('is Deleted', '==', false)

            const announcements = []

            const querySnapshot = await announcementRefs.get()
            const announcementPromises = querySnapshot.docs.map(async (doc) => {
                const author = await this.admin.firestore().collection('users').doc(doc.data()['From']).get()
                const authorName = author.data()['Teacher Info']['Name']
                const { From, ...restData } = doc.data()
                announcements.push({
                    id: doc.id,
                    'From': authorName,
                    ...restData
                })
            })

            await Promise.all(announcementPromises)

            announcements.sort((a, b) => b['Post Date'] - a['Post Date'])

            return announcements
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async addCourseAnnouncement(token, courseId, announcementData) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            if (announcementData['is Test'] === undefined) {
                announcementData['is Test'] = false
            }

            const announcementRef = this.admin.firestore().collection('course announcements')
            const newAnnouncement = await announcementRef.add({
                'Course': courseId,
                'From': uid,
                'Title': announcementData['Title'],
                'Content': announcementData['Content'],
                'Post Date': new Date(),
                'is Test': announcementData['is Test'],
                'is Deleted': false,
            })

            if (announcementData['is Test']) {
                await newAnnouncement.update({
                    'Test Date': announcementData['Test Date'],
                })
            }

            return true
        } catch (error) {
            console.error('Error adding announcement:', error)
            throw error
        }
    }

    async updateCourseAnnouncement(token, announcementId, announcementData) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const announcementRef = this.admin.firestore().collection('course announcements').doc(announcementId)
            await announcementRef.update({
                'Title': announcementData['Title'],
                'Content': announcementData['Content'],
                'is Test': announcementData['is Test'],
                'Test Date': announcementData['Test Date'],
            })

            return true
        } catch (error) {
            console.error('Error editing announcement:', error)
            throw error
        }
    }

    async deleteCourseAnnouncement(token, announcementId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const announcementRef = this.admin.firestore().collection('course announcements').doc(announcementId)
            await announcementRef.update({
                'is Deleted': true,
            })

            return true
        } catch (error) {
            console.error('Error deleting announcement:', error)
            throw error
        }
    }

    async getHolidays(token, academicYear) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid

            const holidays = await this.admin.firestore().collection("holidays")
                .where('Academic Year', '==', academicYear)
                .get().then((querySnapshot) => {
                    const holidays = []
                    querySnapshot.forEach((doc) => {
                        holidays.push({
                            id: doc.id,
                            ...doc.data()
                        }
                        )
                    })
                    return holidays
                })
            return holidays
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getCourseSchedule(token, courseId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)

            const scheduleRef = await this.admin.firestore().collection("course schedule")
                .where('Course', '==', courseId)
            const scheduleSnapshot = await scheduleRef.get()
            const scheduleData = scheduleSnapshot.docs[0].data()

            return scheduleData
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async uploadCourseFile(token, courseId, path, file) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const bucket = this.admin.storage().bucket();
            const rootPrefix = `courses/${courseId}/${path}/`

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

            return true;
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        }
    }

    async getCourseFiles(token, courseId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()
            const rootPrefix = `courses/${courseId}/`

            const [files] = await bucket.getFiles({ prefix: rootPrefix })

            if (!Array.isArray(files)) {
                console.error('Unexpected response from getFiles:', files)
                throw new Error('Unexpected response from storage')
            }

            let allFiles = await Promise.all(files.map(async (file) => {
                file.fileName = file.name.replace(rootPrefix, '')
                if (file.name.includes('assignment') || file.name.includes('Assignment')) return null

                let downloadUrl = null
                let metadata = null
                if (!file.name.endsWith('/')) {
                    [downloadUrl] = await file.getSignedUrl({
                        action: 'read',
                        expires: Date.now() + 3600000 // 1 hour from now
                    });

                    [metadata] = await file.getMetadata();
                }
                return {
                    name: file.fileName,
                    path: file.name,
                    downloadUrl: downloadUrl,
                    contentType: metadata?.contentType,
                    type: file.name.endsWith('/') ? 'directory' : 'file',
                    size: metadata?.size ? parseInt(metadata.size, 10) : null,
                }
            }
            ))
            allFiles = allFiles.filter(file => file !== null && file.name !== '')

            return allFiles
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async deleteCourseFile(token, courseId, filepath) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)
            const prefix = `courses/${courseId}/${filepath}`

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const bucket = this.admin.storage().bucket()
            const file = bucket.file(prefix)

            await file.delete()

            return true
        } catch (error) {
            console.error('Error deleting file:', error)
            throw error
        }
    }

    async addCourseAssignment(token, courseId, assignmentData, files) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()

            assignmentData = JSON.parse(assignmentData)

            if (assignmentData['Visible'] === undefined) {
                assignmentData['Visible'] = false
            }

            const assignmentRef = this.admin.firestore().collection("courses").doc(courseId).collection("assignments")
            const newAssignment = await assignmentRef.add({
                'Title': assignmentData['Title'],
                'Detail': assignmentData['Detail'],
                'Available Date': assignmentData['Available Date'],
                'Due Date': assignmentData['Due Date'],
                'Submission Deadline': assignmentData['Submission Deadline'],
                'Highest Score': parseFloat(assignmentData['Highest Score']),
                'Visible': assignmentData['Visible'],
                'Created By': uid,
                'is Deleted': false,
            })

            const assignmentId = newAssignment.id
            const rootPrefix = `courses/${courseId}/assignment_files/${assignmentId}/`

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

            if (assignmentData['Visible']) {

                const studentRefs = await this.admin.firestore().collection("student and course")
                    .where('Course', '==', this.admin.firestore().collection('courses').doc(courseId))
                    .where('Enrolled', '==', true)
                    .get()

                const tokens = []
                const studentPromises = studentRefs.docs.map(async (doc) => {
                    const studentDoc = await this.admin.firestore().collection('users').doc(doc.data()['Student']).get()
                    const token = studentDoc.data().fcmToken
                    if (token) {
                        tokens.push(token)
                    }
                })

                await Promise.all(studentPromises)

                const message = {
                    notification: {
                        title: 'New Assignment',
                        body: `New Assignment has been uploaded: ${assignmentData['Title']}`,
                    },
                    tokens: tokens,
                }

                getMessaging().sendEachForMulticast(message)
                    .then((response) => {
                        console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                        console.log('Error sending message:', error);
                    });

            }

            return true
        } catch (error) {
            console.error('Error adding assignment:', error)
            throw error
        }
    }

    async updateCourseAssignment(token, courseId, assignmentId, assignmentData, files) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()

            assignmentData = JSON.parse(assignmentData)

            const assignmentRef = this.admin.firestore().collection("courses").doc(courseId).collection("assignments").doc(assignmentId)
            const assignmentDoc = await assignmentRef.get()
            const assignment = assignmentDoc.data()

            if (assignment.notificationJobId) {
                const job = schedule.scheduledJobs[assignment.notificationJobId];
                if (job) {
                    job.cancel()
                }
            }

            await assignmentRef.update({
                'Title': assignmentData['Title'],
                'Detail': assignmentData['Detail'],
                'Available Date': assignmentData['Available Date'],
                'Due Date': assignmentData['Due Date'],
                'Submission Deadline': assignmentData['Submission Deadline'],
                'Highest Score': assignmentData['Highest Score'],
                'Visible': assignmentData['Visible'],
            })

            const rootPrefix = `courses/${courseId}/assignment_files/${assignmentId}/`

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

            if (assignmentData['Visible']) {
                const studentRefs = await this.admin.firestore().collection("student and course")
                    .where('Course', '==', this.admin.firestore().collection('courses').doc(courseId))
                    .where('Enrolled', '==', true)
                    .get()

                const tokens = []
                const studentPromises = studentRefs.docs.map(async (doc) => {
                    const studentDoc = await this.admin.firestore().collection('users').doc(doc.data()['Student']).get()
                    const token = studentDoc.data().fcmToken
                    if (token) {
                        tokens.push(token)
                    }
                })

                await Promise.all(studentPromises)

                let message = {}

                message = {
                    notification: { title: 'Assignment Update', body: `${assignmentData['Title']} has been updated` },
                    tokens: tokens,
                }

                getMessaging().sendEachForMulticast(message)
                    .then((response) => {
                        console.log('Successfully sent message:', response)
                    })
                    .catch((error) => {
                        console.log('Error sending message:', error)
                    })

                if (assignmentData['Due Date']) {

                    message = {
                        notification: { title: 'Assignment Due', body: `Attention: ${assignmentData['Title']} is due today.` },
                        tokens: tokens,
                    }

                    const dueDate = firestoreTimestampToDate(assignmentData['Due Date'])
                    const job = schedule.scheduleJob(dueDate, async () => {
                        getMessaging().sendEachForMulticast(message)
                    })

                    await assignmentRef.update({
                        'notificationJobId': job.name,
                    })

                }

            }



            return true
        } catch (error) {
            console.error('Error adding assignment:', error)
            throw error
        }
    }

    async deleteCourseAssignment(token, courseId, assignmentId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const assignmentRef = this.admin.firestore().collection("courses").doc(courseId).collection("assignments").doc(assignmentId)
            await assignmentRef.update({
                'is Deleted': true,
            })

            return true
        } catch (error) {
            console.error('Error deleting assignment:', error)
            throw error
        }
    }

    async getCourseAssignments(token, courseId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            let assignmentRef = null
            if (role === 'Teacher') {
                assignmentRef = this.admin.firestore().collection("courses").doc(courseId).collection("assignments")
                    .where('is Deleted', '==', false)
            } else if (role === 'Student') {
                assignmentRef = this.admin.firestore().collection("courses").doc(courseId).collection("assignments")
                    .where('is Deleted', '==', false)
                    .where('Visible', '==', true)
            }

            const assignments = await assignmentRef.get().then((querySnapshot) => {
                const assignments = []
                querySnapshot.forEach((doc) => {
                    const docData = doc.data()
                    const { 'Created By': createdBy, ...restData } = docData
                    assignments.push({
                        id: doc.id,
                        ...restData
                    })
                })
                return assignments
            })

            assignments.sort((a, b) => a['Due Date'] - b['Due Date'])

            return assignments
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async getCourseAssignmentFiles(token, courseId, assignmentId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()
            const rootPrefix = `courses/${courseId}/assignment_files/${assignmentId}/`

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

            return allFiles

        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async getAssignmentSubmissions(token, courseId, section, assignmentId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const role = await this.userService.getUserRole(token)
            const admin = this.admin
            const bucket = this.admin.storage().bucket()

            async function getDownloadUrl(fileName) {
                const file = bucket.file(fileName)
                const [url] = await file.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 3600000 // 1 hour from now
                })
                return url
            }

            async function fetchSubmissions(submissionRefs, sectionStudentRefs) {
                if (sectionStudentRefs) {
                    const submissions = []
                    const studentUidDocs = await sectionStudentRefs.get()
                    const submissionDocs = await submissionRefs.get()
                    const studentUids = studentUidDocs.docs.map(doc => doc.data()['Student'])

                    const studentSubmissions = submissionDocs.docs.filter(doc => studentUids.includes(doc.data()['Student']))

                    for (const doc of studentSubmissions) {
                        const studentDoc = await admin.firestore().collection('users').doc(doc.data()['Student']).get()
                        const data = doc.data()
                        const StudentData = studentDoc.data()
                        const downloadUrl = await getDownloadUrl(data['Submitted File'])

                        const { Student, ...restData } = data

                        submissions.push({
                            id: doc.id,
                            'Student ID': StudentData['Student Info']['Student ID'],
                            'Student Name': StudentData['Student Info']['Name'],
                            ...restData,
                            downloadUrl: downloadUrl
                        })
                    }
                    return submissions
                } else {
                    const submissions = await submissionRefs.get().then(async (querySnapshot) => {
                        const submissions = []
                        for (const doc of querySnapshot.docs) {
                            const studentDoc = await admin.firestore().collection('users').doc(doc.data()['Student']).get()
                            const data = doc.data()
                            const StudentData = studentDoc.data()
                            const downloadUrl = await getDownloadUrl(data['Submitted File'])

                            const { Student, ...restData } = data

                            submissions.push({
                                id: doc.id,
                                'Student ID': StudentData['Student Info']['Student ID'],
                                'Student Name': StudentData['Student Info']['Name'],
                                ...restData,
                                downloadUrl: downloadUrl
                            })
                        }
                        return submissions
                    })

                    submissions.sort((a, b) => b['Submission Date'] - a['Submission Date'])

                    return submissions
                }
            }

            if (role === 'Teacher') {
                const sectionStudentRefs = await admin.firestore().collection("student and course")
                    .where('Course', '==', admin.firestore().collection('courses').doc(courseId))
                    .where('Section', '==', section)
                    .where('Enrolled', '==', true)

                const submissionRefs = this.admin.firestore().collection("student and assignment")
                    .where('Assignment', '==', this.admin.firestore()
                        .collection('courses').doc(courseId)
                        .collection('assignments').doc(assignmentId))
                const submissions = await fetchSubmissions(submissionRefs, sectionStudentRefs)

                const latestSubmissions = {}
                submissions.forEach(submission => {
                    const studentId = submission['Student ID']
                    if (submission['Student ID'] == studentId && (!latestSubmissions[studentId]
                        || latestSubmissions[studentId]['Submission Date'] < submission['Submission Date'])) {
                        latestSubmissions[studentId] = submission
                    }
                })

                return Object.values(latestSubmissions)
            } else {
                const uid = decodedToken.uid
                const submissionRef = this.admin.firestore().collection("student and assignment")
                    .where('Student', '==', uid)
                    .where('Assignment', '==', this.admin.firestore().collection('courses').doc(courseId)
                        .collection('assignments').doc(assignmentId))
                return await fetchSubmissions(submissionRef, null)
            }
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async getUserAssignmentGrades(token, courseId, section) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const role = await this.userService.getUserRole(token)

            if (role == 'Student') {
                const assignments = await this.getCourseAssignments(token, courseId)
                for (var assignment of assignments) {
                    const submissions = await this.getAssignmentSubmissions(token, courseId, section, assignment.id)
                    submissions.sort((a, b) => b['Submission Date'] - a['Submission Date'])

                    if (submissions.length > 0) {
                        assignment['Latest Submission'] = submissions[0]
                    }
                }

                return assignments
            }

            if (role == 'Teacher') {
                const assignmentRef = this.admin.firestore().collection("courses").doc(courseId).collection("assignments")
                const assignments = await assignmentRef.get().then(async (querySnapshot) => {
                    const assignments = []
                    for (const doc of querySnapshot.docs) {
                        const data = doc.data()

                        assignments.push({
                            id: doc.id,
                            ...data,
                        })
                    }
                    return assignments
                })

                return assignments
            }
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }


    }

    async submitAssignment(token, courseId, assignmentId, file) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const bucket = this.admin.storage().bucket()
            const rootPrefix = `courses/${courseId}/assignment_submissions/${assignmentId}/`

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

            // create a new submission record in the database
            await this.admin.firestore().collection("student and assignment").doc().set({
                'Student': uid,
                'Assignment': this.admin.firestore().collection('courses').doc(courseId)
                    .collection('assignments').doc(assignmentId),
                'Submission Date': new Date(),
                'Submitted File': fileName,
                'Score': 0,
                'Feedback': '',
            })

            stream.end(file.buffer)

            return true
        } catch (error) {
            console.error('Error submitting assignment:', error)
            throw error
        }
    }

    async gradeAssignment(token, submissionId, score, feedback) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const submissionDoc = await this.admin.firestore().collection("student and assignment").doc(submissionId)

            await submissionDoc.update({
                'Score': score,
                'Feedback': feedback,
            })

            return true
        } catch (error) {
            console.error('Error grading assignment:', error)
            throw error
        }
    }

    async getCourseAttendances(token, courseId, section) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            const attendanceRefs = this.admin.firestore().collection("course attendance")
                .where('Course', '==', courseId)
                .where('Section', '==', section)

            const attendances = await attendanceRefs.get().then((querySnapshot) => {
                const attendances = []
                querySnapshot.forEach((doc) => {
                    const { Students, ...restData } = doc.data()

                    attendances.push({
                        id: doc.id,
                        ...restData,
                    })
                })
                return attendances
            })
            return attendances
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async getAttendanceDetail(token, attendanceId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role == 'Teacher') {

                const attendanceRef = this.admin.firestore().collection("course attendance").doc(attendanceId)
                const attendanceDoc = await attendanceRef.get()
                const attendanceData = attendanceDoc.data()

                for (let i = 0; i < attendanceData.Students.length; i++) {
                    const studentDoc = await this.admin.firestore().collection('users').doc(attendanceData.Students[i]['Student']).get()
                    attendanceData.Students[i]['Student ID'] = studentDoc.data()['Student Info']['Student ID']
                    attendanceData.Students[i]['Name'] = studentDoc.data()['Student Info']['Name']
                }

                return attendanceData
            } else if (role == 'Student') {
                const attendanceRef = this.admin.firestore().collection("course attendance").doc(attendanceId)
                const attendanceDoc = await attendanceRef.get()
                const attendanceData = attendanceDoc.data()

                const studentData = attendanceData.Students.find(student => student.Student === uid)

                return studentData
            }
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async addCourseAttendance(token, courseId, section) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const enrolledStudent = await this.admin.firestore().collection("student and course")
                .where('Course', '==', this.admin.firestore().collection('courses').doc(courseId))
                .where('Section', '==', section)
                .where('Enrolled', '==', true)
                .get().then((querySnapshot) => {
                    const students = []
                    querySnapshot.forEach((doc) => {
                        students.push({
                            Student: doc.data()['Student'],
                            Status: 'Absent',
                        })
                    })
                    return students
                })

            const attendanceRef = this.admin.firestore().collection("course attendance")

            const newAttendance = await attendanceRef.add({
                'Academic Year': process.env.ACADEMIC_YEAR,
                'Course': courseId,
                'Section': section,
                'Class Date': new Date(),
                'Updated At': new Date(),
                'Students': enrolledStudent,
            })

            return newAttendance.id
        } catch (error) {
            console.error('Error adding attendance:', error)
            throw error
        }
    }

    async takeAttendanceTeacher(token, attendanceId, studentUid, status) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const role = await this.userService.getUserRole(token)

            if (role !== 'Teacher') {
                throw new Error('Unauthorized')
            }

            const attendanceRef = this.admin.firestore().collection("course attendance").doc(attendanceId)
            const attendanceDoc = await attendanceRef.get()
            const attendanceData = attendanceDoc.data()

            const updatedStudents = attendanceData.Students.map(student => {
                if (student.Student === studentUid) {
                    return {
                        ...student,
                        'Updated At': new Date(),
                        Status: status
                    }
                }
                return student
            })

            await attendanceRef.update({
                'Students': updatedStudents,
            })

            return true
        } catch (error) {
            console.error('Error taking attendance:', error)
            throw error
        }
    }

    async studentCheckIn(token, courseId, section, attendanceId, hash, timestamp) {
        const role = await this.userService.getUserRole(token)

        if (role !== 'Student') {
            throw new Error('Unauthorized')
        }

        const currentTime = Date.now()
        if (Math.abs(currentTime - timestamp) > 10000) {
            throw new Error('QR code expired')
        }

        const apiEndpoint = `${process.env.BACKEND_URL}/user/courses/${courseId}/${section}/attendance/${attendanceId}/checkin`

        const expectedHash = crypto.createHash('sha256').update(apiEndpoint + timestamp).digest('hex')
        console.log('hash:', hash)
        console.log('Expected hash:', expectedHash)
        if (hash !== expectedHash) {
            throw new Error('Invalid QR code')
        }

        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid

            const attendanceRef = this.admin.firestore().collection("course attendance").doc(attendanceId)
            const attendanceDoc = await attendanceRef.get()
            const attendanceData = attendanceDoc.data()

            const updatedStudents = attendanceData.Students.map(student => {
                if (student.Student === uid) {
                    return {
                        ...student,
                        'Updated At': new Date(),
                        Status: 'Present'
                    }
                }
            })

            await attendanceRef.update({
                'Students': updatedStudents,
                'Updated At': new Date(),
            })

            return true
        } catch (error) {
            console.error('Error taking attendance:', error)
            throw error
        }

    }
}