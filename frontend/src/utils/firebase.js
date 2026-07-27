
import { initializeApp } from "firebase/app";
import {getAuth , GoogleAuthProvider} from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "intervu-5953d.firebaseapp.com",
  projectId: "intervu-5953d",
  storageBucket: "intervu-5953d.firebasestorage.app",
  messagingSenderId: "938352090719",
  appId: "1:938352090719:web:16b9832a503e26e4f405ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth,provider}