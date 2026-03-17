import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

function initAdmin() {
  if (admin.apps.length) return admin;

  if (process.env.FIREBASE_PROJECT_ID) {
    // Production: use environment variables set in Railway
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Railway encodes newlines as literal \n in env vars — restore them
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    // Local dev fallback: read serviceAccountKey.json from disk
    const serviceAccountPath = path.join(process.cwd(), "backend", "serviceAccountKey.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  return admin;
}

export function getDb() {
  return initAdmin().firestore();
}

// Lazy proxy: looks like a normal `db` to all importers but Firebase is only
// initialised on the first actual method call (i.e. at request time, not build time)
export const db = new Proxy(
  {},
  {
    get(_, prop) {
      return getDb()[prop];
    },
  }
);

export { admin };