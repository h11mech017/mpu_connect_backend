import { UserService } from "./UserService.js";

export class AdminService {
    constructor(admin) {
        this.admin = admin;
        this.userService = new UserService(admin);
    }

    async checkAdmin(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const userRef = this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get()

            await this.admin.auth().verifyIdToken(token);
            const role = await this.userService.getUserRole(token);

            if (userDoc.exists && role === "Admin"){
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async checkRole(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const userRef = this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get()

            await this.admin.auth().verifyIdToken(token);
            const role = await this.userService.getUserRole(token);

            if (userDoc.exists && (role === "Admin" || role === "Teacher")) {
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
                'Status': status,
                'Updated At': new Date()
            });
            return true
        } catch (error) {
            return false
        }
    }

    async addLostItem(token, form) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token)
            const adminRef = await this.admin.firestore().collection('users').doc(decodedToken.uid)
            const adminDoc = await adminRef.get()
            const adminId = adminDoc.data()['Admin ID']

            await this.admin.firestore().collection('lost and found').add({
                ...form,
                'Updated By': adminId,
            })
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async claimLostItem(itemId, data) {
        try {
            const lostItemRef = this.admin.firestore().collection('lost and found').doc(itemId);
            await lostItemRef.update({
                ...data,
                'Status': 'Claimed',
                'Claim Date': new Date()
            });
            return true
        } catch (error) {
            return false
        }
    }
}