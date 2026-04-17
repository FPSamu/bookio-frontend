import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

let app, auth, googleProvider

try {
  app           = initializeApp(firebaseConfig)
  auth          = getAuth(app)
  googleProvider = new GoogleAuthProvider()
} catch (e) {
  console.error('[Bookio] Firebase no configurado. Crea .env.local con las variables VITE_FIREBASE_*.')
  // Exportamos mocks para que la app renderice sin crashear
  auth           = { currentUser: null, onAuthStateChanged: (_cb) => () => {} }
  googleProvider = null
}

export { auth, googleProvider }
