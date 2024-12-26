import multer from "multer"
import { UserService } from "./UserService.js"


const upload = multer({ storage: multer.memoryStorage() })

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

            if (userRole === 'Student') {
                const courseRefs = await this.admin.firestore().collection("student and course")
                    .where('Student', '==', uid)
                    .where('Enrolled', '==', true)
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
            } else if (userRole === 'Teacher') {
                const courseRefs = await this.admin.firestore().collection("teacher and course")
                .where('Teacher', '==', uid)
                .where('Teaching', '==', true)
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
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getCourseDetail(token, courseId) {
    }

    async getCourseFiles(token, courseId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const bucket = this.admin.storage().bucket();
            const rootPrefix = `courses/${courseId}/`;

            const [files] = await bucket.getFiles({ prefix: rootPrefix })

            if (!Array.isArray(files)) {
                console.error('Unexpected response from getFiles:', files);
                throw new Error('Unexpected response from storage');
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
            console.error('Error listing contents:', error);
            throw error;
        }
    }

    async getCourseAssignments(token, courseId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            const assignmentRef = this.admin.firestore().collection("courses").doc(courseId).collection("assignments")
            const assignments = await assignmentRef.get().then((querySnapshot) => {
                const assignments = []
                querySnapshot.forEach((doc) => {
                    assignments.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                return assignments
            })

            return assignments
        } catch (error) {
            console.error('Error listing contents:', error);
            throw error;
        }
    }

    async getCourseAssignmentFiles(token, courseId, assignmentId) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const bucket = this.admin.storage().bucket();
            const rootPrefix = `courses/${courseId}/assignment_files/${assignmentId}/`;

            const [assignments] = await bucket.getFiles({ prefix: rootPrefix })

            if (!Array.isArray(assignments)) {
                console.error('Unexpected response from getFiles:', assignments);
                throw new Error('Unexpected response from storage');
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

                    [metadata] = await file.getMetadata();
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

            return allFiles;

        } catch (error) {
            console.error('Error listing contents:', error);
            throw error;
        }
    }

    async submitAssignment(token, courseId, assignmentId, file) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const bucket = this.admin.storage().bucket();
            const rootPrefix = `courses/${courseId}/assignment_submissions/${assignmentId}/`;

            const fileName = `${rootPrefix}${file.originalname}`;
            const fileUpload = bucket.file(fileName);

            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            stream.on('error', (error) => {
                console.error('Error uploading file:', error);
                throw error;
            });

            stream.on('finish', () => {
                console.log('File uploaded successfully');
            });

            stream.end(file.buffer);

            return true;
        } catch (error) {
            console.error('Error submitting assignment:', error);
            throw error;
        }
    }
}