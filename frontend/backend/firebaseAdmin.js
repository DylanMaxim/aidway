import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

const serviceAccountPath = path.join(process.cwd(), "backend", "serviceAccountKey.json");

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };