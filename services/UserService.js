export class UserService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin
    }

    async getUserProfile(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const userRef = this.admin.firestore().collection("users").doc(uid)
            const userDoc = await userRef.get()
            const userData = userDoc.data()
            if (userData['Role'] === 'Student') {
                const programDoc = await userData['Student Info']['Program'].get()
                const programData = programDoc.data()
                const facultyName = (await userData['Student Info']['Faculty'].get()).data()['EName']
                userData['Student Info']['Faculty'] = facultyName
                userData['Student Info']['Program Code'] = programData['Program Code']
                userData['Student Info']['Program Name'] = programData['Program Name']
                userData['Student Info']['Language'] = programData['Language']

                await userData.delete

                return userData
            } else if (userData['Role'] === 'Teacher') {
                const facultyName = (await userData['Teacher Info']['Faculty'].get()).data()['EName']
                userData['Teacher Info']['Faculty'] = facultyName

                await userData.delete

                return userData
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getUserRole(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
            const userRef = this.admin.firestore().collection("users").doc(uid)
            const userDoc = await userRef.get()
            const userData = userDoc.data()
            return userData['Role']
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getUserAssignments(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid
    
            const userRole = await this.getUserRole(token)
    
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
    
            const assignmentData = await courseRefs.get().then(async (querySnapshot) => {
                const coursePromises = []
    
                querySnapshot.forEach((doc) => {
                    const enrollData = doc.data()
                    const coursePromise = enrollData.Course.get().then(async (courseDoc) => {
                        const { Student, Section, ...restCourseData } = enrollData
                        const assignmentsRef = this.admin.firestore().collection("courses").doc(courseDoc.id).collection("assignments")
                        const assignmentsSnapshot = await assignmentsRef.where('is Deleted', '==', false).get()
    
                        let assignments = assignmentsSnapshot.docs.map(assignmentDoc => {
                            const assignmentData = assignmentDoc.data()
                            const dueDate = assignmentData['Due Date']
                            const dueDateObj = new Date(dueDate._seconds * 1000 + dueDate._nanoseconds / 1000000) 
                            const currentDate = new Date()
    
                            if (currentDate <= dueDateObj) {
                                return {
                                    id: assignmentDoc.id,
                                    ...assignmentData
                                }
                            }
                            else {
                                return null
                            }
                        })

                        assignments = assignments.filter(assignment => assignment !== null)
    
                        if (assignments.length > 0) {
                            return {
                                id: courseDoc.id,
                                'Course Code': courseDoc.data()['Course Code'],
                                'Course Name': courseDoc.data()['Course Name'],
                                'Section': Section,
                                Assignments: assignments
                            }
                        }
                        return null
                    })
                    coursePromises.push(coursePromise)
                })
    
                const resolvedCourses = await Promise.all(coursePromises)
                const filteredCourses = resolvedCourses.filter(course => course !== null)
    
                return filteredCourses
            })
    
            return assignmentData
        } catch (error) {
            throw new Error(error.message)
        }
    }

}
