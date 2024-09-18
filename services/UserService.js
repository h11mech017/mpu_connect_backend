export class UserService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
    }

    async getUserProfile(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const userRef = this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get();

            return userDoc.data();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
