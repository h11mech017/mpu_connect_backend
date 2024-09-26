
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
            const applicationsRef = this.admin.firestore().collection('parking');
            const applications = await applicationsRef.get().then((querySnapshot) => {
                const applications = [];
                querySnapshot.forEach((doc) => {
                  applications.push({
                    id: doc.id, 
                    ...doc.data(),
                  })
                })
                return applications
            }
            )
            return applications;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateParkingApplicationStatus(applicationId, status) {
        try {
            const applicationRef = this.admin.firestore().collection('parking').doc(applicationId);
            await applicationRef.update({
                'Status': status
            });
            return true
        } catch (error) {
            return false
        }
    }
}