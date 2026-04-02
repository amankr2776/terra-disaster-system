import { initializeApp, getApps, getApp } from "firebase/app"
import { 
  getDatabase, ref, onValue, set, push, 
  serverTimestamp, get, query, limitToLast 
} from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyBkPm8Db1tYYoEdFk449gEuJzsDtK5uuI8",
  authDomain: "terra-digital-twin.firebaseapp.com",
  databaseURL: "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "terra-digital-twin",
  storageBucket: "terra-digital-twin.firebasestorage.app",
  messagingSenderId: "882724206359",
  appId: "1:882724206359:web:479c4ac2e0dc4a5b15e952"
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const database = getDatabase(app)

export { app, database, ref, onValue, set, push, serverTimestamp, get, query, limitToLast }