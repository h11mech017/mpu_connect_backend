export class CourseService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin
    }

    async getUserCourses(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const uid = decodedToken.uid

            const userRef = this.admin.firestore().collection("users").doc(uid)
            const userDoc = await userRef.get()
            const userData = userDoc.data()

            if (userData['Role'] === 'Student') {
                const courseRefs = await this.admin.firestore().collection("student and course").where('Student', '==', uid)
                const coursesData = await courseRefs.get().then(async (querySnapshot) => {
                    const courses = []
                    const coursePromises = []
            
                    querySnapshot.forEach((doc) => {
                        const courseData = doc.data();
                        const coursePromise = courseData.Course.get().then(courseDoc => {
                            const { Student, ...restCourseData } = courseData
                            return {
                                id: doc.id,
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
            } else {
                return null
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async applyForParking(token, form) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const parkAppRef = this.admin.firestore().collection("parking");
            const parkAppDoc = await parkAppRef.doc(uid).get();

            if (await parkAppDoc.exists) {
                throw new Error("You have already applied for parking");
            } else {
                const userRef = this.admin.firestore().collection("users").doc(uid);
                const userDoc = await userRef.get();
                const userData = await userDoc.data();

                await this.admin.firestore().collection("parking").doc(uid).set({
                    ...form,
                    'Name': userData['Student Info']['Name'],
                    'Student ID': userData['Student Info']['Student ID'],
                    'Applied At': new Date(),
                    'Status': 'Pending',
                    'Card valid till': userData['Card valid till']
                });
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}