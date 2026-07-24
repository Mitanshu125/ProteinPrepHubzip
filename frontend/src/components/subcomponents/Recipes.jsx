import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"

const API = import.meta.env.VITE_BACKEND_URL

function isToday(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function ProteinBar() {
  const { isLoggedIn, token } = useAuth()
  const [proteinConsumed, setProteinConsumed] = useState(0)
  const [proteinGoal, setProteinGoal] = useState(160)

  const loadGuestData = () => {
    const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]")
    const todaysAdded = added.filter((entry) => isToday(entry.date))
    const total = todaysAdded.reduce((sum, entry) => sum + (entry.protein || 0), 0)
    setProteinConsumed(total)
    setProteinGoal(parseInt(localStorage.getItem("proteinGoal") || "160"))
  }

  const loadUserData = async () => {
    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProteinGoal(data.proteinGoal || 160)
      const todaysMeals = (data.mealHistory || []).filter((m) => isToday(m.loggedAt))
      const total = todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0)
      setProteinConsumed(total)
    } catch (err) {
      console.error("Failed to load protein data:", err)
    }
  }

  useEffect(() => {
    isLoggedIn ? loadUserData() : loadGuestData()
  }, [isLoggedIn])

  useEffect(() => {
    const handler = () => (isLoggedIn ? loadUserData() : loadGuestData())
    window.addEventListener("proteinUpdate", handler)
    return () => window.removeEventListener("proteinUpdate", handler)
  }, [isLoggedIn, token])

  const proteinPct = Math.min(Math.round((proteinConsumed / proteinGoal) * 100), 100)

  return (
    <div className="hero-protein-card hero-protein-card--inline">
      <div className="hero-protein-top">
        <span className="hero-protein-label">TODAY'S PROTEIN</span>
        <span className="hero-protein-trend">↗</span>
      </div>
      <div className="hero-protein-value">
        <span className="hero-protein-num">{proteinConsumed}g</span>
        <span className="hero-protein-goal"> / {proteinGoal}g</span>
      </div>
      <div className="hero-protein-bar-track">
        <div className="hero-protein-bar-fill" style={{ width: proteinPct + "%" }} />
      </div>
    </div>
  )
}

const CALORIE_FILTERS = [
  { label: "All Calories", fn: () => true },
  { label: "Under 200 cal", fn: (r) => r.nutrition?.calories < 200 },
  { label: "200–400 cal", fn: (r) => r.nutrition?.calories >= 200 && r.nutrition?.calories <= 400 },
  { label: "Above 400 cal", fn: (r) => r.nutrition?.calories > 400 },
];

const SORT_OPTIONS = [
  { label: "Default", fn: null },
  { label: "Highest Protein", fn: (a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0) },
  { label: "Lowest Calories", fn: (a, b) => (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0) },
  { label: "Quickest Cook Time", fn: (a, b) => parseMins(a.cookingTime) - parseMins(b.cookingTime) },
];

const ALL_TAGS = ["Vegetarian", "Vegan", "High Protein", "Low Carb", "Quick Meal"];

function parseMins(str = "") {
  const hr = str.match(/(\d+)\s*hr/i);
  const min = str.match(/(\d+)\s*min/i);
  return (hr ? parseInt(hr[1]) * 60 : 0) + (min ? parseInt(min[1]) : 0);
}
function getTagStyle(tag) {
  if (tag === "Vegetarian" || tag === "Vegan") return "card-tag-diet";
  if (tag === "High Protein" || tag === "Low Carb") return "card-tag-nutrition";
  if (tag === "Quick Meal") return "card-tag-time";
  return "card-tag-nutrition";
}
function loadGuestFavourites() {
  try { return new Set(JSON.parse(localStorage.getItem("favourites") || "[]")); }
  catch { return new Set(); }
}

function Recipes({recipes}) {
  const { isLoggedIn, token } = useAuth()
  const [query, setQuery] = useState("");
  const [calFilter, setCalFilter] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [activeTags, setActiveTags] = useState([]);
  const [showFavs, setShowFavs] = useState(false);
  const [favourites, setFavourites] = useState(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  // Maps recipeId -> { qty, entryIds } for meals added TODAY, so cards can
  // show "already added" state and let you remove one.
  const [todayLog, setTodayLog] = useState({});

  const loadTodayLog = async () => {
    if (isLoggedIn) {
      try {
        const res = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        const map = {}
        ;(data.mealHistory || []).forEach((m) => {
          if (!m.recipe || !isToday(m.loggedAt)) return
          const key = m.recipe.toString ? m.recipe.toString() : m.recipe
          if (!map[key]) map[key] = { qty: 0, entryIds: [] }
          map[key].qty += 1
          map[key].entryIds.push(m._id)
        })
        setTodayLog(map)
      } catch (err) {
        console.error("Failed to load today's log:", err)
      }
    } else {
      const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]")
      const map = {}
      added.filter((entry) => isToday(entry.date)).forEach((entry) => {
        if (!map[entry.id]) map[entry.id] = { qty: 0 }
        map[entry.id].qty += 1
      })
      setTodayLog(map)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          const ids = (data.savedRecipes || []).map((r) => r._id || r)
          setFavourites(new Set(ids))
        })
        .catch((err) => console.error("Failed to load favourites:", err))
    } else {
      setFavourites(loadGuestFavourites())
    }
    loadTodayLog()
  }, [isLoggedIn, token]);

  const toggleFav = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (!isLoggedIn) localStorage.setItem("favourites", JSON.stringify([...next]));
      return next;
    });

    if (!isLoggedIn && !sessionStorage.getItem("loginNudgeShown")) {
      sessionStorage.setItem("loginNudgeShown", "1");
      setShowLoginPrompt(true);
    }

    if (isLoggedIn) {
      try {
        await fetch(`${API}/users/favourites/${id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to update favourite:", err);
      }
    }
  };

  const addToDay = async (e, element) => {
    e.preventDefault();
    e.stopPropagation();
    const protein = element.nutrition?.protein || 0;
    const calories = element.nutrition?.calories || 0;
    const carbs = element.nutrition?.carbs || 0;
    const fats = element.nutrition?.fats || 0;

    if (isLoggedIn) {
      try {
        await fetch(`${API}/users/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipe: element.id,
            title: element.title,
            protein,
            calories,
            carbs,
            fats,
            serving: element.cookingTime || "",
          }),
        });
        await loadTodayLog();
      } catch (err) {
        console.error("Failed to log meal:", err);
      }
    } else {
      const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]");
      added.push({ id: element.id, protein, date: new Date().toISOString() });
      localStorage.setItem("proteinAdded", JSON.stringify(added));
      await loadTodayLog();
    }
    window.dispatchEvent(new Event("proteinUpdate"));
  };

  const removeFromDay = async (e, element) => {
    e.preventDefault();
    e.stopPropagation();
    const entry = todayLog[element.id];
    if (!entry) return;

    if (isLoggedIn) {
      const entryId = entry.entryIds?.[entry.entryIds.length - 1];
      if (!entryId) return;
      try {
        await fetch(`${API}/users/history/${entryId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        await loadTodayLog();
      } catch (err) {
        console.error("Failed to remove meal:", err);
      }
    } else {
      const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]");
      const idx = [...added].reverse().findIndex((a) => a.id === element.id && isToday(a.date));
      if (idx !== -1) {
        const realIdx = added.length - 1 - idx;
        added.splice(realIdx, 1);
        localStorage.setItem("proteinAdded", JSON.stringify(added));
      }
      await loadTodayLog();
    }
    window.dispatchEvent(new Event("proteinUpdate"));
  };

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  let result = showFavs
    ? recipes.filter((r) => favourites.has(r.id))
    : recipes.filter(CALORIE_FILTERS[calFilter].fn);

  if (!showFavs && activeTags.length > 0) {
    result = result.filter((r) => activeTags.every((t) => r.tags?.includes(t)));
  }
  result = result.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()));
  const sortFn = SORT_OPTIONS[sortIdx].fn;
  const sorted = sortFn ? [...result].sort(sortFn) : result;

  const isFiltering = query.trim().length > 0 || calFilter !== 0 || sortIdx !== 0 || activeTags.length > 0 || showFavs;

  return (
    <>
    <article className="recipes">
      <ProteinBar />
      <div className="recipes-section-header">
        <span className="section-badge">🍴 Curated Recipes</span>
        <h2 className="section-title">Chef-Crafted, Macro-Optimized</h2>
        <p className="section-sub">Every recipe is designed to maximize protein intake while keeping meals delicious and simple to prepare.</p>
      </div>

      <div className="recipes-toolbar">
        <div className="recipes-toolbar-top">
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-bar"
              type="text"
              placeholder="Search recipes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery("")}>✕</button>
            )}
          </div>

          <select
            className="calorie-filter"
            value={calFilter}
            onChange={(e) => { setCalFilter(Number(e.target.value)); setShowFavs(false); }}
          >
            {CALORIE_FILTERS.map((f, i) => (
              <option key={i} value={i}>{f.label}</option>
            ))}
          </select>

          <select
            className="calorie-filter"
            value={sortIdx}
            onChange={(e) => setSortIdx(Number(e.target.value))}
          >
            {SORT_OPTIONS.map((s, i) => (
              <option key={i} value={i}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="recipes-toolbar-bottom">
          <div className="tag-filters">
            <button
              className={`tag-btn fav-filter-btn${showFavs ? " tag-btn-active" : ""}`}
              onClick={() => { setShowFavs((v) => !v); setActiveTags([]); setCalFilter(0); }}
            >
              {showFavs ? "❤️" : "🤍"} Favourites
              {favourites.size > 0 && <span className="fav-count">{favourites.size}</span>}
            </button>
            {!showFavs && ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-btn${activeTags.includes(tag) ? " tag-btn-active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
            {activeTags.length > 0 && (
              <button className="tag-btn-clear" onClick={() => setActiveTags([])}>Clear ✕</button>
            )}
          </div>

        </div>
      </div>

      {isFiltering ? (
        <>
          <h3>
            {showFavs
              ? sorted.length > 0 ? `${sorted.length} favourite${sorted.length !== 1 ? "s" : ""}` : "No favourites yet — heart a recipe!"
              : sorted.length > 0 ? `${sorted.length} result${sorted.length !== 1 ? "s" : ""}` : "No results found"
            }
          </h3>
          <section className="container">
            {sorted.map((element, index) => (
              <Card
                key={index}
                element={element}
                favourites={favourites}
                toggleFav={toggleFav}
                onAddToDay={addToDay}
                onRemoveFromDay={removeFromDay}
                todayEntry={todayLog[element.id]}
              />
            ))}
          </section>
        </>
      ) : (
        <>
          <section className="container">
            {recipes.slice(0,8).map((element, index) => (
              <Card
                key={index}
                element={element}
                favourites={favourites}
                toggleFav={toggleFav}
                onAddToDay={addToDay}
                onRemoveFromDay={removeFromDay}
                todayEntry={todayLog[element.id]}
              />
            ))}
          </section>

          <h3>Recommended Recipes</h3>

          <section className="container">
            {recipes.slice(8,16).map((element, index) => (
              <Card
                key={index}
                element={element}
                favourites={favourites}
                toggleFav={toggleFav}
                onAddToDay={addToDay}
                onRemoveFromDay={removeFromDay}
                todayEntry={todayLog[element.id]}
              />
            ))}
          </section>
        </>
      )}

    </article>

    {showLoginPrompt && (
      <div className="login-nudge-overlay" onClick={() => setShowLoginPrompt(false)}>
        <div className="login-nudge-card" onClick={(e) => e.stopPropagation()}>
          <button className="login-nudge-close" onClick={() => setShowLoginPrompt(false)}>✕</button>
          <span className="login-nudge-icon">❤️</span>
          <h3>Save this recipe for good</h3>
          <p>You're browsing as a guest — favourites and meal tracking are saved on this device only. Create a free account to keep them everywhere you log in.</p>
          <div className="login-nudge-actions">
            <Link to="/signup" className="login-nudge-signup">Sign Up</Link>
            <Link to="/login" className="login-nudge-login">Log In</Link>
          </div>
          <button className="login-nudge-dismiss" onClick={() => setShowLoginPrompt(false)}>Maybe later</button>
        </div>
      </div>
    )}
    </>
  )
}

export default Recipes

function Card({ element, favourites, toggleFav, onAddToDay, onRemoveFromDay, todayEntry }) {
  const n = element.nutrition;
  const isFav = favourites.has(element.id);
  const qty = todayEntry?.qty || 0;

  return (
    <Link className="card" to={`/recipe/${element.id}`} >
      <div className="card-img-wrapper">
        <img src={element.image} alt={element.title} />
        <div className="card-overlay">
          <span className="card-time">{element.cookingTime}</span>
          {n && <span className="protein-badge">{n.protein}g protein</span>}
        </div>
        <button
          className="heart-btn"
          onClick={(e) => toggleFav(e, element.id)}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <h4>{element.title}</h4>
      {element.tags && element.tags.length > 0 && (
  <div className="card-tags">
    {element.tags.slice(0, 2).map((t) => (
      <span key={t} className={`card-tag ${getTagStyle(t)}`}>{t}</span>
    ))}
    {element.tags.length > 2 && (
      <span className="card-tag card-tag-more">+{element.tags.length - 2}</span>
    )}
  </div>
)}
      {n && (
        <div className="card-mini-stats">
          <span className="mini-stat">🔥 {n.calories} cal</span>
          <span className="mini-stat">💪 {n.protein}g</span>
          <span className="mini-stat">🌾 {n.carbs}g carbs</span>
        </div>
      )}

      {qty > 0 ? (
        <div className="added-to-day-row">
          <button
            className="added-qty-btn"
            onClick={(e) => onRemoveFromDay(e, element)}
            aria-label="Remove one from today"
          >
            −
          </button>
          <span className="added-qty-label">✓ Added ({qty})</span>
          <button
            className="added-qty-btn"
            onClick={(e) => onAddToDay(e, element)}
            aria-label="Add another"
          >
            +
          </button>
        </div>
      ) : (
        <button
          className="add-to-day-btn"
          onClick={(e) => onAddToDay(e, element)}
        >
          + Add to My Day
        </button>
      )}
    </Link>
  );
}