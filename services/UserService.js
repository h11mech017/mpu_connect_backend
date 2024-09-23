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
