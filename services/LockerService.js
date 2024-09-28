export class LockerService {
    constructor(firebaseAdmin) {
        this.admin = firebaseAdmin;
    }

    async getUserLocker(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            const userRef = this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            if (userData['Role'] === 'Student') {
                if (userData['Student Info']['Locker']) {
                    const lockerRef = this.admin.firestore().collection("lockers").doc(userData['Student Info']['Locker']);
                    const lockerDoc = await lockerRef.get();
                    const lockerData = lockerDoc.data();
                    return {
                        'Locker No.': lockerDoc.id,
                        'Locker Location': lockerData['Location']
                    }
                }
                else {
                    throw new Error("You have not applied for a locker");
                }
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async applyForLocker(token) {
        try {
            const decodedToken = await this.admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            const userRef = this.admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            if (userData['Role'] === 'Student') {
                if (userData['Student Info']['Locker']) {
                    throw new Error("You have already applied for a locker");
                }
                else {
                    const faculty = userData['Student Info']['Faculty'];

                    const availableLockers = await this.admin.firestore().collection("lockers")
                        .where("Faculty", "==", faculty)
                        .where("Status", "==", "Available")
                        .get().then((querySnapshot) => {
                            const lockers = [];
                            querySnapshot.forEach((doc) => {
                                lockers.push({
                                    id: doc.id,
                                    ...doc.data(),
                                })
                            })
                            return lockers
                        })

                    if (availableLockers.length === 0) {
                        throw new Error("No lockers available for your faculty");
                    } else {
                        const firstLocker = availableLockers[0];
                        await this.admin.firestore().collection("lockers").doc(firstLocker.id).update({
                            'Status': 'Occupied',
                            'Applied At': new Date(),
                            'User': userData['Student Info']['Student ID'],
                        })
                        await userRef.update({
                            'Student Info.Locker': firstLocker.id
                        })
                    }
                }
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}