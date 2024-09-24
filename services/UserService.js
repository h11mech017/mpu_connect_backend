export class UserService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
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

    async getUserProfile(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const userRef = await this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get()
            const userData = await userDoc.data();
            if (userData['Role'] === 'Student') {
                const studentProgramCode = userData['Student Info']['Program Code'];
                const programRef = await this.admin.firestore().collection("programs").doc(studentProgramCode);
                const programDoc = await programRef.get();

                return {
                    ...userData['Student Info'],
                    'Program Name': await programDoc.data()['Program Name'],
                    'Language': await programDoc.data()['Language']
                }
            }

            return userDoc.data();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getUserQrCode(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const qrCodeRef = this.admin.storage().bucket().file(`users/${uid}/qr_code/${uid}_qr_code.png`);

            const signedUrl = await qrCodeRef.getSignedUrl({
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000
            })
            return signedUrl;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
