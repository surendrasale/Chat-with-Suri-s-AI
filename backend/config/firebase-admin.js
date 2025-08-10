const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// For development, we'll use the Firebase project config
// In production, you should use a service account key
const firebaseConfig = {
  projectId: "ai-chat-bot-445ad",
  // For production, add your service account key here
};

if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

const auth = admin.auth();

// Verify Firebase ID token
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      success: true,
      user: decodedToken
    };
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  admin,
  auth,
  verifyFirebaseToken
};