export class CourseService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
    }

    async getCourses(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            if (this.admin.firestore().collection("courses").doc(uid)) {
                const applicationRef = await this.admin.firestore().collection("parking").doc(uid);
                const applicationDoc = await applicationRef.get();
                return applicationDoc.data();
            } else {
                return null
            }
        } catch (error) {
            throw new Error(error.message);
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