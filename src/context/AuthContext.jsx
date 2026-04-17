import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)  // { id, email, name, role, avatarUrl }
  const [loading, setLoading] = useState(true)

  // Sync Firebase session → fetch profile from our DB
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { data } = await api.get('/auth/me')
          setUser(data.user)
        } catch (err) {
          // 401 = Firebase session exists but user not in our DB yet (normal on first visit)
          if (err?.response?.status !== 401) console.error(err)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const registerWithEmail = async ({ email, password, role, name, phone }) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    const idToken = await firebaseUser.getIdToken()
    const { data } = await api.post('/auth/register', { idToken, role, name, phone })
    setUser(data.user)
    return data.user
  }

  const loginWithEmail = async ({ email, password }) => {
    await signInWithEmailAndPassword(auth, email, password)
    const { data } = await api.get('/auth/me')
    setUser(data.user)
    return data.user
  }

  const loginWithGoogle = async (role = null) => {
    const { user: firebaseUser } = await signInWithPopup(auth, googleProvider)
    const idToken = await firebaseUser.getIdToken()

    if (role) {
      // Sign-up flow: create user in our DB with the given role
      const { data } = await api.post('/auth/register', {
        idToken,
        role,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
      })
      setUser(data.user)
      return data.user
    } else {
      // Login flow: user must already exist in our DB
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      return data.user
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, registerWithEmail, loginWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
