// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDFL1B5lfibv73QsHQVr4TeWMAD68xwmd8',
  authDomain: 'sistema-compras-preview.firebaseapp.com',
  projectId: 'sistema-compras-preview',
  storageBucket: 'sistema-compras-preview.firebasestorage.app',
  messagingSenderId: '812182136957',
  appId: '1:812182136957:web:e08f9c2f35421d4b126914',
  measurementId: 'G-ZE427RJTQG',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)

export { analytics, app, auth, db }
