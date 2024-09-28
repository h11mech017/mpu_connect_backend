export class LockerService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
    }

    async applyForLocker(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            const lockerAppDoc = this.admin.firestore().collection("lockers").doc(uid).get();

            if (await lockerAppDoc.exists) {
                throw new Error("You have already applied for locker");
            } else {
                const userRef = this.admin.firestore().collection("users").doc(uid);
                const userDoc = await userRef.get();
                const userData = userDoc.data();
                const faculty = userData['Student Info']['Faculty'];

                const querySanpshot = await this.admin.firestore().collection("lockers")
                    .where("Faculty", "==", faculty)
                    .where("Status", "==", "Available")
                    .get();
                
                return querySanpshot.docs.map(doc => doc.data());
            }

        } catch (error) {
            throw new Error(error.message);
        }
    }
}