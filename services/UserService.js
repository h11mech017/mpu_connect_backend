import admin from "firebase-admin";

export class UserService {
    static async getUserProfile(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;
            const userRef = admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get();

            return userDoc.data();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}