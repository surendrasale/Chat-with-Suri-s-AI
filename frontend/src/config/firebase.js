// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "doamin name",
  projectId: "projectId",
  storageBucket: "storageBucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId",
  measurementId: "measurementId"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firebase Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user,
      token: await result.user.getIdToken()
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: result.user,
      token: await result.user.getIdToken()
    };
  } catch (error) {
    console.error('Email signup error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: result.user,
      token: await result.user.getIdToken()
    };
  } catch (error) {
    console.error('Email sign-in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent successfully!'
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export { auth, analytics };
export default app;