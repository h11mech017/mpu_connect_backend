import admin from "firebase-admin";

export class UserController {
  async login(req, res) {
    try {
      console.log("User logs in");

      const { studentId, password } = req.body;
      const email = `${studentId}@mpu.edu.mo`;

      const auth = admin.auth();

      const userRecord = await auth.getUserByEmail(email);

      const customToken = await auth.createCustomToken(userRecord.uid);
      res.status(200).json({
        message: "User logged in successfully",
        uid: userRecord.uid,
        customToken: customToken,
      });
    } catch (error) {
      res.status(400).send(error.message);
      console.log(error.message);
    }
  }
}
