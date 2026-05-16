import { useState, useEffect } from "react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MEALS = ["Breakfast", "Lunch", "Dinner"]
const STORAGE_KEY = "mealPlan"

function loadPlan() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }
  catch { return {} }
}

function getWeekRange(offset = 0) {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return { label: `${fmt(monday)} — ${fmt(sunday)}, ${sunday.getFullYear()}` }
}

function MealPlannerPage({ recipes }) {
  const [plan, setPlan] = useState(loadPlan)
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
  }, [plan])

  const setMeal = (dayIdx, meal, recipeId) => {
    const day = DAYS[dayIdx]
    setPlan(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [meal]: recipeId }
    }))
  }

  const clearAll = () => setPlan({})

  const getRecipe = (dayIdx, meal) => {
    const id = plan[DAYS[dayIdx]]?.[meal]
    if (!id) return null
    return recipes.find(r => r.id === parseInt(id)) || null
  }

  const getDayTotals = dayIdx => {
    let cal = 0, protein = 0
    MEALS.forEach(meal => {
      const r = getRecipe(dayIdx, meal)
      if (r?.nutrition) { cal += r.nutrition.calories || 0; protein += r.nutrition.protein || 0 }
    })
    return { cal, protein }
  }

  const weekTotals = DAYS.reduce((acc, _, i) => {
    const t = getDayTotals(i)
    return { cal: acc.cal + t.cal, protein: acc.protein + t.protein }
  }, { cal: 0, protein: 0 })

  const hasMealsForDay = dayIdx => MEALS.some(meal => getRecipe(dayIdx, meal))
  const { label } = getWeekRange(weekOffset)

  return (
    <div className="planner-page">
      <div className="planner-section-header">
        <span className="section-badge">📅 Weekly Planner</span>
        <h2 className="section-title">Plan Your Week Ahead</h2>
        <p className="section-sub">Organize your meals in advance to hit your protein targets consistently.</p>
      </div>

      <div className="planner-main-card">
        <div className="planner-week-nav">
          <div className="planner-week-left">
            <button className="planner-week-arrow" onClick={() => setWeekOffset(w => w - 1)}>‹</button>
            <span className="planner-week-label">{label}</span>
            <button className="planner-week-arrow" onClick={() => setWeekOffset(w => w + 1)}>›</button>
          </div>
          <div className="planner-week-right">
            {weekTotals.protein > 0 && (
              <span className="planner-week-totals">{weekTotals.protein}g protein &nbsp;·&nbsp; {weekTotals.cal} cal</span>
            )}
            <button className="planner-clear-btn" onClick={clearAll}>Clear All</button>
          </div>
        </div>

        <div className="planner-day-tabs">
          {DAYS_SHORT.map((day, i) => (
            <button
              key={i}
              className={`planner-day-tab${selectedDay === i ? " active" : ""}`}
              onClick={() => setSelectedDay(i)}
            >
              {day}
              {hasMealsForDay(i) && <span className="planner-day-dot" />}
            </button>
          ))}
        </div>

        <div className="planner-day-content">
          {MEALS.map(meal => {
            const recipe = getRecipe(selectedDay, meal)
            return (
              <div key={meal} className="planner-meal-slot">
                <span className="planner-meal-type">{meal.toUpperCase()}</span>
                {recipe ? (
                  <div className="planner-meal-filled">
                    <div className="planner-meal-info">
                      <span className="planner-meal-name">{recipe.title}</span>
                      <div className="planner-meal-stats-row">
                        <span className="planner-meal-stat-protein">{recipe.nutrition?.protein}g protein</span>
                        <span className="planner-meal-sep">·</span>
                        <span>{recipe.nutrition?.calories} cal</span>
                      </div>
                    </div>
                    <button className="planner-meal-remove" onClick={() => setMeal(selectedDay, meal, "")}>✕</button>
                  </div>
                ) : (
                  <select
                    className="planner-select"
                    value=""
                    onChange={e => e.target.value && setMeal(selectedDay, meal, e.target.value)}
                  >
                    <option value="">— Add a recipe —</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MealPlannerPage
