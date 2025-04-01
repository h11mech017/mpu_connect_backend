import dotenv from "dotenv"
import admin from "firebase-admin"
import { setupRoutes } from "./routes/index.js"
import express from "express"
import cors from "cors"

dotenv.config()

const app = express()
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    }

    const allowedOrigins = [
      'https://mpu-connect-admin.pages.dev',
      'https://mpuadmin.ech017.tech',
      'http://localhost:5173',
    ]

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Mobile-App']
}))
app.use(express.json())
app.use("/api", setupRoutes())

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
})

const db = admin.firestore()

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

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})