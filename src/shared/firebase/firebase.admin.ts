import * as admin from 'firebase-admin';

function getAdmin(): typeof admin {
  if (!admin.apps.length) {
    const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
      throw new Error(
        'Firebase credentials eksik. .env dosyasına FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL ekleyin.'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: FIREBASE_CLIENT_EMAIL,
      }),
    });
  }

  return admin;
}

export { getAdmin as admin };