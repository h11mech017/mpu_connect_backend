export class ParkingService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
    }

    async applyForParking(token, form) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            if (this.admin.firestore().collection("parking").doc(uid).exists) {
                throw new Error("You have already applied for parking");

            } else {
                const userRef = await this.admin.firestore().collection("users").doc(uid);
                const userDoc = await userRef.get();
                const userData = await userDoc.data();

                await this.admin.firestore().collection("parking").doc(uid).set({
                    ...form,
                    'Name': userData['Student Info']['Name'],
                    'Student ID': userData['Student Info']['Student ID'],
                    'Applied At': new Date(),
                    'Status': 'Pending'
                });
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}