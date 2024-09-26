export class AdminService {
    constructor(admin) {
        this.admin = admin;
    }

    async checkAdmin(token) {
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

    async getParkingApplications() {
        try {
            const applicationsRef = await this.admin.firestore().collection('parking').get();
            const applications = applicationsRef.docs.map(doc => doc.data());
            return applications;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}