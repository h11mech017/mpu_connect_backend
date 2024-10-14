import dotenv from "dotenv"
import admin from "firebase-admin"
import { setupRoutes } from "./routes/index.js"
import express from "express"
import cors from "cors"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", setupRoutes());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// async function batchInsertDocuments() {
//   const batch = db.batch();
//   const startId = 1;
//   const endId = 247;

//   for (let i = startId; i <= endId; i++) {
//     const docId = `N-${i.toString().padStart(4, '0')}`;
//     const docRef = db.collection('lockers').doc(docId);

//     const data = {
//       Faculty: 'FCSD',
//       Location: 'Multisport Pavilion 1/F',
//       Status: 'Available'
//     };

//     batch.set(docRef, data);
//   }

//   try {
//     await batch.commit();
//     console.log(`Inserted ${endId - startId + 1} documents.`);
//   } catch (error) {
//     console.error('Error inserting documents:', error);
//   }
// }

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
