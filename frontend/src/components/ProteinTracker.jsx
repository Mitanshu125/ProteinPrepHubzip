import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useUserData } from "../context/UserDataContext"

const API = import.meta.env.VITE_BACKEND_URL

const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"]

const RECIPE_OPTIONS = [
  { name: "Paneer Tikka Bowl",     protein: 24, calories: 380, carbs: 28, fats: 14, serving: "1 bowl (300g)" },
  { name: "Tofu Scramble",         protein: 20, calories: 220, carbs: 12, fats: 10, serving: "1 plate (250g)" },
  { name: "Egg White Omelette",    protein: 23, calories: 130, carbs:  4, fats:  2, serving: "3 egg whites" },
  { name: "Greek Yogurt Parfait",  protein: 18, calories: 210, carbs: 22, fats:  5, serving: "1 cup (200g)" },
  { name: "Lentil Dal",            protein: 16, calories: 280, carbs: 38, fats:  6, serving: "1 bowl (350g)" },
  { name: "Chickpea Stir Fry",     protein: 14, calories: 310, carbs: 34, fats: 10, serving: "1 plate (300g)" },
  { name: "Quinoa Salad",          protein: 12, calories: 260, carbs: 32, fats:  8, serving: "1 bowl (280g)" },
  { name: "Paneer Bhurji",         protein: 22, calories: 340, carbs: 10, fats: 18, serving: "1 plate (250g)" },
  { name: "Soya Chunks Curry",     protein: 28, calories: 320, carbs: 20, fats:  8, serving: "1 bowl (300g)" },
  { name: "Moong Dal Chilla",      protein: 15, calories: 180, carbs: 24, fats:  4, serving: "2 pieces" },
  { name: "Rajma Bowl",            protein: 13, calories: 290, carbs: 40, fats:  5, serving: "1 bowl (350g)" },
  { name: "Cottage Cheese Salad",  protein: 19, calories: 200, carbs:  8, fats:  9, serving: "1 bowl (250g)" },
]

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getStreak() {
  try { return JSON.parse(localStorage.getItem("streakLog") || "[]") }
  catch { return [] }
}

function computeStreakFromDates(dates) {
  const set = new Set(dates)
  const today = new Date()
  const todayStr = today.toDateString()

  let start = new Date(today)
  if (!set.has(todayStr)) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (!set.has(yesterday.toDateString())) return 0
    start = yesterday
  }

  let count = 0
  const d = new Date(start)
  while (set.has(d.toDateString())) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

function GoalEditor({ label, value, unit, onSave, onCancel }) {
  const [input, setInput] = useState(value)
  const handleSave = () => {
    const parsed = parseFloat(input)
    if (!isNaN(parsed) && parsed > 0) onSave(parsed)
  }
  return (
    <div className="pt-goal-edit">
      <span className="pt-goal-edit-label">{label}</span>
      <input
        type="number"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="pt-goal-input"
        onKeyDown={e => e.key === "Enter" && handleSave()}
        autoFocus
        step={unit === "L" ? "0.25" : "1"}
        min={unit === "L" ? "0.25" : "1"}
      />
      <span className="pt-unit">{unit}</span>
      <button onClick={handleSave} className="pt-save-btn">Save</button>
      <button onClick={onCancel} className="pt-cancel-btn">✕</button>
    </div>
  )
}

function ProteinTracker() {
  const { isLoggedIn, token } = useAuth()
  const { userData, loading, refreshUserData } = useUserData()

  const [calorieGoal, setCalorieGoal] = useState(() => parseInt(localStorage.getItem("calorieGoal") || "2200"))
  const [waterGoal, setWaterGoal] = useState(() => parseFloat(localStorage.getItem("waterGoal") || "2.5"))
  const [water, setWater] = useState(() => parseFloat(localStorage.getItem("waterLiters") || "0"))

  const [guestConsumed, setGuestConsumed] = useState(() => parseInt(localStorage.getItem("proteinConsumed") || "0"))
  const [guestGoal, setGuestGoal] = useState(() => parseInt(localStorage.getItem("proteinGoal") || "160"))
  const [guestMeals, setGuestMeals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mealLog") || "[]") }
    catch { return [] }
  })

  const [selectedRecipe, setSelectedRecipe] = useState("")
  const [editingGoal, setEditingGoal] = useState(null)
  const [streak, setStreak] = useState(0)

  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1

  const { consumed, goal, meals } = useMemo(() => {
    if (!isLoggedIn) {
      return { consumed: guestConsumed, goal: guestGoal, meals: guestMeals }
    }
    if (!userData) return { consumed: 0, goal: 160, meals: [] }

    const history = userData.mealHistory || []
    const todaysHistory = history.filter(
      (m) => new Date(m.loggedAt).toDateString() === new Date().toDateString()
    )
    const total = todaysHistory.reduce((sum, m) => sum + (m.protein || 0), 0)

    const groups = []
    todaysHistory.forEach((m) => {
      const existing = groups.find((g) => g.name === m.title)
      if (existing) {
        existing.qty += 1
        existing.entryIds.push(m._id)
        existing.time = m.loggedAt ? formatTime(new Date(m.loggedAt)) : existing.time
      } else {
        groups.push({
          name: m.title,
          protein: m.protein || 0,
          calories: m.calories || 0,
          carbs: m.carbs || 0,
          fats: m.fats || 0,
          serving: m.serving || "",
          time: m.loggedAt ? formatTime(new Date(m.loggedAt)) : "",
          qty: 1,
          entryIds: [m._id],
        })
      }
    })

    return { consumed: total, goal: userData.proteinGoal || 160, meals: groups }
  }, [isLoggedIn, userData, guestConsumed, guestGoal, guestMeals])

  const pct = Math.min(Math.round((consumed / goal) * 100), 100)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  const chosen = RECIPE_OPTIONS.find(r => r.name === selectedRecipe) || null
  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0) * (m.qty || 1), 0)

  useEffect(() => {
    if (isLoggedIn && userData) {
      const history = userData.mealHistory || []
      const loggedDates = history.map((m) => new Date(m.loggedAt).toDateString())
      setStreak(computeStreakFromDates(loggedDates))
    } else if (!isLoggedIn) {
      setStreak(computeStreakFromDates(getStreak()))
    }
  }, [isLoggedIn, userData])

  useEffect(() => {
    const handler = () => {
      if (!isLoggedIn) {
        const c = parseInt(localStorage.getItem("proteinConsumed") || "0")
        setGuestConsumed(c)
        const log = getStreak()
        const todayStr = new Date().toDateString()
        if (!log.includes(todayStr)) {
          log.push(todayStr)
          localStorage.setItem("streakLog", JSON.stringify(log.slice(-30)))
        }
        setStreak(computeStreakFromDates(getStreak()))
      } else {
        const log = getStreak()
        const todayStr = new Date().toDateString()
        if (!log.includes(todayStr)) {
          log.push(todayStr)
          localStorage.setItem("streakLog", JSON.stringify(log.slice(-30)))
        }
      }
    }
    window.addEventListener("proteinUpdate", handler)
    return () => window.removeEventListener("proteinUpdate", handler)
  }, [isLoggedIn])

  const logMealToAccount = (mealData) => {
    return fetch(`${API}/users/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealData),
    })
  }

  const addMeal = () => {
    if (!chosen) return

    if (isLoggedIn) {
      logMealToAccount({
        title: chosen.name,
        protein: chosen.protein,
        calories: chosen.calories,
        carbs: chosen.carbs,
        fats: chosen.fats,
        serving: chosen.serving,
      })
        .then(() => refreshUserData())
        .catch((err) => console.error("Failed to log meal:", err))
    } else {
      const existing = guestMeals.findIndex(m => m.name === chosen.name)
      let updated
      if (existing >= 0) {
        updated = guestMeals.map((m, i) => i === existing ? { ...m, qty: (m.qty || 1) + 1 } : m)
      } else {
        updated = [...guestMeals, {
          name: chosen.name,
          protein: chosen.protein,
          calories: chosen.calories,
          carbs: chosen.carbs,
          fats: chosen.fats,
          serving: chosen.serving,
          time: formatTime(new Date()),
          qty: 1,
        }]
      }
      setGuestMeals(updated)
      localStorage.setItem("mealLog", JSON.stringify(updated))
      const newConsumed = guestConsumed + chosen.protein
      setGuestConsumed(newConsumed)
      localStorage.setItem("proteinConsumed", String(newConsumed))
    }

    window.dispatchEvent(new Event("proteinUpdate"))
    setSelectedRecipe("")
  }

  const incrementMeal = (index) => {
    const meal = meals[index]

    if (isLoggedIn) {
      logMealToAccount({
        title: meal.name,
        protein: meal.protein,
        calories: meal.calories,
        carbs: meal.carbs,
        fats: meal.fats,
        serving: meal.serving,
      })
        .then(() => refreshUserData())
        .catch((err) => console.error("Failed to log meal:", err))
    } else {
      const updated = guestMeals.map((m, i) => i === index ? { ...m, qty: (m.qty || 1) + 1 } : m)
      setGuestMeals(updated)
      localStorage.setItem("mealLog", JSON.stringify(updated))
      const newConsumed = guestConsumed + meal.protein
      setGuestConsumed(newConsumed)
      localStorage.setItem("proteinConsumed", String(newConsumed))
    }

    window.dispatchEvent(new Event("proteinUpdate"))
  }

  const removeMeal = (index) => {
    const meal = meals[index]

    if (isLoggedIn) {
      const entryId = meal.entryIds?.[meal.entryIds.length - 1]
      if (!entryId) return
      fetch(`${API}/users/history/${entryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(() => refreshUserData())
        .catch((err) => console.error("Failed to remove meal:", err))
    } else {
      const qty = meal.qty || 1
      let updated
      if (qty > 1) {
        updated = guestMeals.map((m, i) => i === index ? { ...m, qty: qty - 1 } : m)
      } else {
        updated = guestMeals.filter((_, i) => i !== index)
      }
      setGuestMeals(updated)
      localStorage.setItem("mealLog", JSON.stringify(updated))
      const newConsumed = Math.max(0, guestConsumed - meal.protein)
      setGuestConsumed(newConsumed)
      localStorage.setItem("proteinConsumed", String(newConsumed))
    }

    window.dispatchEvent(new Event("proteinUpdate"))
  }

  const addWater = () => {
    const w = Math.round((water + 0.25) * 100) / 100
    setWater(w)
    localStorage.setItem("waterLiters", String(w))
  }

  const removeWater = () => {
    const w = Math.max(0, Math.round((water - 0.25) * 100) / 100)
    setWater(w)
    localStorage.setItem("waterLiters", String(w))
  }

  const reset = () => {
    setWater(0)
    localStorage.setItem("waterLiters", "0")
    localStorage.setItem("proteinAdded", "[]")

    if (isLoggedIn) {
      const allIds = meals.flatMap((m) => m.entryIds || [])
      Promise.all(
        allIds.map((id) =>
          fetch(`${API}/users/history/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      )
        .then(() => refreshUserData())
        .catch((err) => console.error("Failed to reset meals:", err))
    } else {
      setGuestMeals([])
      setGuestConsumed(0)
      localStorage.setItem("mealLog", "[]")
      localStorage.setItem("proteinConsumed", "0")
    }

    window.dispatchEvent(new Event("proteinUpdate"))
  }

  const saveProteinGoal = (val) => {
    const g = Math.max(1, Math.round(val))
    if (isLoggedIn) {
      fetch(`${API}/users/goal`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proteinGoal: g }),
      })
        .then(() => refreshUserData())
        .catch((err) => console.error("Failed to update goal:", err))
    } else {
      setGuestGoal(g)
      localStorage.setItem("proteinGoal", String(g))
    }
    setEditingGoal(null)
  }

  const saveCalorieGoal = (val) => {
    const g = Math.max(1, Math.round(val))
    setCalorieGoal(g)
    localStorage.setItem("calorieGoal", String(g))
    setEditingGoal(null)
  }

  const saveWaterGoal = (val) => {
    const g = Math.max(0.25, Math.round(val * 4) / 4)
    setWaterGoal(g)
    localStorage.setItem("waterGoal", String(g))
    setEditingGoal(null)
  }

  if (loading) {
    return (
      <section className="tracker-section" id="tracker-section">
        <div className="tracker-section-header">
          <span className="section-badge">📊 Daily Tracking</span>
          <h2 className="section-title">Track Every Gram</h2>
        </div>
        <div className="tracker-layout">
          <div className="tracker-main-card" style={{ minHeight: 400 }}>
            <p className="tracker-empty">Loading your progress...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="tracker-section" id="tracker-section">
      <div className="tracker-section-header">
        <span className="section-badge">📊 Daily Tracking</span>
        <h2 className="section-title">Track Every Gram</h2>
        <p className="section-sub">Log your meals, monitor your macros, and stay on track with your daily goals.</p>
      </div>

      <div className="tracker-layout">
        <div className="tracker-main-card">
          <div className="tracker-card-top">
            <span className="tracker-card-heading">Today's Progress</span>
            <span className="tracker-card-date">
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="tracker-ring-row">
            <div className="tracker-ring-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a06820" />
                    <stop offset="100%" stopColor="#daa04e" />
                  </linearGradient>
                </defs>
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#ede7de" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r={radius}
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 70 70)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
              <div className="tracker-ring-label">
                <span className="tracker-ring-num">{consumed}g</span>
                <span className="tracker-ring-sub">of {goal}g</span>
              </div>
            </div>

            <div className="tracker-macros">
              <div className="tracker-macro-item">
                <span className="macro-icon">💪</span>
                <div>
                  <div className="macro-val">{consumed}g <span className="macro-goal">/ {goal}g</span></div>
                  <div className="macro-label">Protein</div>
                </div>
              </div>
              <div className="tracker-macro-item">
                <span className="macro-icon">🔥</span>
                <div>
                  <div className="macro-val">{totalCalories} <span className="macro-goal">/ {calorieGoal}</span></div>
                  <div className="macro-label">Calories</div>
                </div>
              </div>
              <div className="tracker-macro-item">
                <span className="macro-icon">💧</span>
                <div style={{ flex: 1 }}>
                  <div className="macro-val">{water}L <span className="macro-goal">/ {waterGoal}L</span></div>
                  <div className="macro-label">Water</div>
                </div>
                <div className="water-controls">
                  <button className="water-btn water-minus" onClick={removeWater} disabled={water === 0}>−</button>
                  <button className="water-btn water-plus" onClick={addWater}>+</button>
                </div>
              </div>

              <div className="tracker-btn-row">
                {editingGoal === "protein" ? (
                  <GoalEditor label="Protein" value={goal} unit="g" onSave={saveProteinGoal} onCancel={() => setEditingGoal(null)} />
                ) : editingGoal === "calories" ? (
                  <GoalEditor label="Calories" value={calorieGoal} unit="kcal" onSave={saveCalorieGoal} onCancel={() => setEditingGoal(null)} />
                ) : editingGoal === "water" ? (
                  <GoalEditor label="Water" value={waterGoal} unit="L" onSave={saveWaterGoal} onCancel={() => setEditingGoal(null)} />
                ) : (
                  <div className="pt-goals-row">
                    <button className="pt-edit-btn" onClick={() => setEditingGoal("protein")}>
                      💪 {goal}g ✎
                    </button>
                    <button className="pt-edit-btn" onClick={() => setEditingGoal("calories")}>
                      🔥 {calorieGoal} ✎
                    </button>
                    <button className="pt-edit-btn" onClick={() => setEditingGoal("water")}>
                      💧 {waterGoal}L ✎
                    </button>
                    <button className="pt-reset-btn" onClick={reset}>Reset</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tracker-meal-log">
            {meals.length === 0 && (
              <p className="tracker-empty">No meals logged yet — add your first meal below.</p>
            )}
            {meals.map((m, i) => (
              <div key={i} className="tracker-meal-row">
                <span className="meal-dot" />
                <div className="meal-info">
                  <span className="meal-name">{m.name}</span>
                  <span className="meal-time">{m.time} · {m.serving}</span>
                </div>
                <span className="meal-protein">{(m.protein * (m.qty || 1))}g</span>
                <div className="meal-qty-controls">
                  <button className="meal-qty-btn" onClick={() => removeMeal(i)} title="Decrease">−</button>
                  <span className="meal-qty-num">{m.qty || 1}</span>
                  <button className="meal-qty-btn" onClick={() => incrementMeal(i)} title="Increase">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="tracker-add-meal">
            <div className="recipe-select-wrap">
              <select
                className="tracker-recipe-select"
                value={selectedRecipe}
                onChange={e => setSelectedRecipe(e.target.value)}
              >
                <option value="">— Choose a recipe —</option>
                {RECIPE_OPTIONS.map(r => (
                  <option key={r.name} value={r.name}>
                    {r.name} · {r.protein}g protein · {r.serving}
                  </option>
                ))}
              </select>
              {chosen && (
                <div className="recipe-select-preview">
                  <span>🍽 {chosen.serving}</span>
                  <span>💪 {chosen.protein}g protein</span>
                  <span>🔥 {chosen.calories} cal</span>
                </div>
              )}
            </div>
            <button className="tracker-add-btn" onClick={addMeal} disabled={!chosen}>+</button>
          </div>
        </div>

        <div className="tracker-sidebar">
          <div className="streak-card">
            <h4 className="sidebar-card-title">Weekly Streak</h4>
            <div className="streak-days-row">
              {DAYS_SHORT.map((d, i) => (
                <div key={i} className={`streak-day${i === dayOfWeek ? " streak-today" : i < dayOfWeek ? " streak-done" : ""}`}>
                  {d}
                </div>
              ))}
            </div>
            <p className="streak-msg">
              {streak > 0
                ? `${streak} day streak! Keep going 🔥`
                : "No streak yet — log a meal today to start one!"}
            </p>
          </div>

          <div className="sources-card">
            <h4 className="sidebar-card-title">Macros</h4>

            <div className="source-row">
              <div className="source-header-row">
                <span className="source-name">Protein</span>
                <span className="source-amount">{consumed}g / {goal}g</span>
              </div>
              <div className="source-bar-track">
                <div className="source-bar-fill" style={{ width: `${Math.min((consumed / goal) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="source-row">
              <div className="source-header-row">
                <span className="source-name">Calories</span>
                <span className="source-amount">{totalCalories} / {calorieGoal}</span>
              </div>
              <div className="source-bar-track">
                <div className="source-bar-fill" style={{ width: `${Math.min((totalCalories / calorieGoal) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="source-row">
              <div className="source-header-row">
                <span className="source-name">Carbs</span>
                <span className="source-amount">
                  {meals.reduce((s, m) => s + (m.carbs || 0) * (m.qty || 1), 0)}g / 200g
                </span>
              </div>
              <div className="source-bar-track">
                <div className="source-bar-fill" style={{ width: `${Math.min((meals.reduce((s, m) => s + (m.carbs || 0) * (m.qty || 1), 0) / 200) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="source-row">
              <div className="source-header-row">
                <span className="source-name">Fats</span>
                <span className="source-amount">
                  {meals.reduce((s, m) => s + (m.fats || 0) * (m.qty || 1), 0)}g / 60g
                </span>
              </div>
              <div className="source-bar-track">
                <div className="source-bar-fill" style={{ width: `${Math.min((meals.reduce((s, m) => s + (m.fats || 0) * (m.qty || 1), 0) / 60) * 100, 100)}%` }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default ProteinTracker