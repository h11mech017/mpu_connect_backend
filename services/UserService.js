export class UserService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
    }

    async getUserProfile(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const userRef = this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get()
            const userData = userDoc.data()
            if (userData['Role'] === 'Student') {
                const studentProgramCode = userData['Student Info']['Program Code'];
                const programRef = await this.admin.firestore().collection("programs").doc(studentProgramCode);
                const programDoc = await programRef.get();
                const programData = programDoc.data();
                const facultyName = (await userData['Student Info']['Faculty'].get()).data()['Faculty Name'];
                userData['Student Info']['Faculty'] = facultyName;
                userData['Student Info']['Program Name'] = programData['Program Name'];
                userData['Student Info']['Language'] = programData['Language'];

                return userData
            }

            return userData
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
