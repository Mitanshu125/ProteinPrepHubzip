import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"

const API = import.meta.env.VITE_BACKEND_URL

const UserDataContext = createContext(null)

export function UserDataProvider({ children }) {
  const { isLoggedIn, token } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(isLoggedIn)

  const refreshUserData = useCallback(async () => {
    if (!isLoggedIn) {
      setUserData(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUserData(data)
    } catch (err) {
      console.error("Failed to load account data:", err)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, token])

  useEffect(() => {
    setLoading(isLoggedIn)
    refreshUserData()
  }, [isLoggedIn, refreshUserData])

  // Every part of the app that logs a meal, toggles a favourite, or edits a
  // goal dispatches "proteinUpdate" already. Instead of each component
  // re-fetching on that event, we refetch once here and everyone reads
  // the updated shared data.
  useEffect(() => {
    const handler = () => refreshUserData()
    window.addEventListener("proteinUpdate", handler)
    return () => window.removeEventListener("proteinUpdate", handler)
  }, [refreshUserData])

  return (
    <UserDataContext.Provider value={{ userData, loading, refreshUserData }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error("useUserData must be used within a UserDataProvider")
  return ctx
}