import { UserService } from "./UserService.js"

export class CourseService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin
        this.userService = new UserService(firebaseAdmin)
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
                    const courseData = doc.data();
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

            const [assignments] = await bucket.getFiles({ prefix: rootPrefix })

            if (!Array.isArray(assignments)) {
                console.error('Unexpected response from getFiles:', assignments)
                throw new Error('Unexpected response from storage')
            }


            let allFiles = await Promise.all(assignments.map(async (file) => {
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

    async getAssignmentSubmissions(token, courseId, assignmentId) {
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

            async function fetchSubmissions(submissionRef) {
                const submissions = await submissionRef.get().then(async (querySnapshot) => {
                    const submissions = []
                    for (const doc of querySnapshot.docs) {
                        const studentDoc = await admin.firestore().collection('users').doc(doc.data()['Student']).get()
                        const data = doc.data()
                        const StudentData = studentDoc.data()
                        const downloadUrl = await getDownloadUrl(data['Submitted File'])

                        const { Student, ...restData } = data

                        submissions.push({
                            id: doc.id,
                            Student: StudentData['Student Info']['Student ID'],
                            ...restData,
                            downloadUrl: downloadUrl
                        })
                    }
                    return submissions
                })
                return submissions
            }

            if (role === 'Teacher') {
                const submissionRef = this.admin.firestore().collection("student and assignment")
                    .where('Assignment', '==', this.admin.firestore().collection('courses').doc(courseId)
                        .collection('assignments').doc(assignmentId))
                const submissions = await fetchSubmissions(submissionRef)

                const latestSubmissions = {}
                submissions.forEach(submission => {
                    const studentId = submission.Student
                    if (submission['Student'] == studentId && (!latestSubmissions[studentId] || latestSubmissions[studentId]['Submission Date'] < submission['Submission Date'])) {
                        latestSubmissions[studentId] = submission
                        console.log(latestSubmissions)
                    }
                })

                return Object.values(latestSubmissions)
            } else {
                const uid = decodedToken.uid
                const submissionRef = this.admin.firestore().collection("student and assignment")
                    .where('Student', '==', uid)
                    .where('Assignment', '==', this.admin.firestore().collection('courses').doc(courseId)
                        .collection('assignments').doc(assignmentId))
                return await fetchSubmissions(submissionRef)
            }
        } catch (error) {
            console.error('Error listing contents:', error)
            throw error
        }
    }

    async getUserAssignmentGrades(token, courseId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const role = await this.userService.getUserRole(token)

            if (role == 'Student') {
                const assignments = await this.getCourseAssignments(token, courseId)
                for (var assignment of assignments) {
                    const submission = await this.getAssignmentSubmissions(token, courseId, assignment.id)
                    if (submission.length > 0) {
                        assignment['Latest Submission'] = submission.pop()
                    }
                }

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
}