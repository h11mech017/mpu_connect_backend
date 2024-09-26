export class UserService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
    }

    async getUserProfile(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const userRef = await this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get()
            const userData = await userDoc.data()
            if (userData['Role'] === 'Student') {
                const studentProgramCode = userData['Student Info']['Program Code'];
                const programRef = await this.admin.firestore().collection("programs").doc(studentProgramCode);
                const programDoc = await programRef.get();
                const programData = programDoc.data();
                const facultyDoc = await ((await this.admin.firestore().collection("faculties").doc(await programData['Faculty'])).get());

                return {
                    ...userData,
                    'Program Name': programData['Program Name'],
                    'Language': programData['Language'],
                    'Faculty': facultyDoc.data()['Faculty Name']
                }
            }

            return userData
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
