import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase client web configuration loaded from Next.js environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase Client
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface AuthenticatedUser {
  user_id: number;
  uid: string;
  name: string;
  email: string;
  role: 'asha' | 'admin';
}

/**
 * Trigger Firebase Google Sign-In, retrieve ID Token, 
 * verify with Flask API, and save user profile locally.
 */
export async function loginWithGoogle(): Promise<AuthenticatedUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    // Call Flask backend login route to verify token using base API url from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    const response = await fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ idToken })
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to verify ID token on backend");
    }
    
    const resData = await response.json();
    const user: AuthenticatedUser = resData.user;
    
    if (typeof window !== "undefined") {
      localStorage.setItem("jr_user", JSON.stringify(user));
      // Dispatch a custom event to notify other components (e.g. Navbar)
      window.dispatchEvent(new Event("jr_auth_change"));
    }
    
    return user;
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
}

/**
 * Signs out from Firebase and clears local storage credentials.
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
    if (typeof window !== "undefined") {
      localStorage.removeItem("jr_user");
      window.dispatchEvent(new Event("jr_auth_change"));
    }
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}

/**
 * Returns the currently signed-in user context from local storage.
 */
export function getStoredUser(): AuthenticatedUser | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("jr_user");
    if (userStr) {
      try {
        return JSON.parse(userStr) as AuthenticatedUser;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}
