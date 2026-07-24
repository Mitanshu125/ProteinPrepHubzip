import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const API = import.meta.env.VITE_BACKEND_URL

function ProfilePage() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [goalInput, setGoalInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const loadProfile = () => {
    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setGoalInput(data.proteinGoal)
      })
      .catch((err) => console.error("Failed to load profile:", err))
  }

  useEffect(() => {
    loadProfile()
  }, [token])

 const confirmLogout = () => {
  logout()
  navigate("/")
}
  const handleGoalSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch(`${API}/users/goal`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proteinGoal: Number(goalInput) }),
      })
      const data = await res.json()
      setProfile((prev) => ({ ...prev, proteinGoal: data.proteinGoal }))
      setMessage("Goal updated!")
      window.dispatchEvent(new Event("proteinUpdate"))
    } catch (err) {
      setMessage("Failed to update goal")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p className="profile-loading">Loading your profile...</p>
      </div>
    )
  }

  const totalMeals = profile.mealHistory?.length || 0
  const totalProtein = profile.mealHistory?.reduce((sum, m) => sum + (m.protein || 0), 0) || 0
  const totalFavourites = profile.savedRecipes?.length || 0
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : ""

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div className="profile-banner-blob" />
        <div className="profile-banner-content">
          <div className="profile-avatar-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-banner-info">
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            {memberSince && <p className="profile-since">Member since {memberSince}</p>}
          </div>
          <button className="profile-logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            <span>⎋</span> Logout
          </button>
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-stats">
          <div className="profile-stat-card">
            <span className="profile-stat-icon">❤️</span>
            <span className="profile-stat-num">{totalFavourites}</span>
            <span className="profile-stat-label">Saved Recipes</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">🍽️</span>
            <span className="profile-stat-num">{totalMeals}</span>
            <span className="profile-stat-label">Meals Logged</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">💪</span>
            <span className="profile-stat-num">{totalProtein}g</span>
            <span className="profile-stat-label">Total Protein</span>
          </div>
        </div>

        <form className="profile-goal-form" onSubmit={handleGoalSave}>
          <div className="profile-goal-heading">
            <span className="profile-goal-icon">🎯</span>
            <div>
              <label>Daily Protein Goal</label>
              <p className="profile-goal-hint">This drives your progress ring on the tracker.</p>
            </div>
          </div>
          <div className="profile-goal-row">
            <div className="profile-goal-input-wrap">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                min="1"
                required
              />
              <span className="profile-goal-unit">g</span>
            </div>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {message && <p className="profile-goal-message">✓ {message}</p>}
        </form>

        <div className="profile-history">
          <h3>Meal History</h3>
          {totalMeals === 0 ? (
            <div className="profile-empty-card">
              <span>🍳</span>
              <p>No meals logged yet. Add one from the Recipes page!</p>
            </div>
          ) : (
            <ul className="profile-history-list">
              {[...profile.mealHistory].reverse().map((meal, i) => (
                <li key={i} className="profile-history-item">
                  <div className="profile-history-left">
                    <span className="profile-history-dot">🍽️</span>
                    <div>
                      <span className="profile-history-title">{meal.title}</span>
                      <div className="profile-history-macros">
                        <span>🔥 {meal.calories || 0} cal</span>
                        {meal.carbs ? <span>🌾 {meal.carbs}g carbs</span> : null}
                        {meal.fats ? <span>🥑 {meal.fats}g fats</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="profile-history-right">
                    <span className="profile-history-protein">{meal.protein}g protein</span>
                    <span className="profile-history-date">
                      {new Date(meal.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-card" onClick={(e) => e.stopPropagation()}>
            <span className="logout-confirm-icon">⎋</span>
            <h3>Log out?</h3>
            <p>You'll need to log back in to see your saved recipes, protein goal, and meal history.</p>
            <div className="logout-confirm-actions">
              <button className="logout-confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="logout-confirm-confirm" onClick={confirmLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage