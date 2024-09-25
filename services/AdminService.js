export class AdminService {
    constructor(admin) {
        this.admin = admin;
    }

    async adminCheck(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            const userRef = await this.admin.firestore().collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (userDoc.exists && userDoc.data()['Role'] === 'Admin') {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}