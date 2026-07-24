import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SERVING_OPTIONS = [1, 2, 4];
const API = import.meta.env.VITE_BACKEND_URL;

function scale(val, servings) {
  return val ? Math.round(val * servings * 10) / 10 : null;
}

function isToday(dateStr) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function loadGuestFavourites() {
  try { return new Set(JSON.parse(localStorage.getItem("favourites") || "[]")); }
  catch { return new Set(); }
}

function RecipeDetails({ recipes }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const [recipeDetails, setRecipeDetails] = useState({});
  const [servings, setServings] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [todayQty, setTodayQty] = useState(0);
  const [todayEntryIds, setTodayEntryIds] = useState([]);

  useEffect(() => {
    const filteredRecipe = recipes.find((recipe) => recipe.id == id);
    if (filteredRecipe) { setRecipeDetails(filteredRecipe); setServings(1); }
  }, [id, recipes]);

  const loadAccountState = () => {
    if (isLoggedIn) {
      fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          const favIds = (data.savedRecipes || []).map((r) => (r._id || r).toString());
          setIsFav(favIds.includes(id));

          const todays = (data.mealHistory || []).filter(
            (m) => m.recipe && m.recipe.toString() === id && isToday(m.loggedAt)
          );
          setTodayQty(todays.length);
          setTodayEntryIds(todays.map((m) => m._id));
        })
        .catch((err) => console.error("Failed to load account state:", err));
    } else {
      setIsFav(loadGuestFavourites().has(id));
      const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]");
      const todays = added.filter((a) => a.id === id && isToday(a.date));
      setTodayQty(todays.length);
    }
  };

  useEffect(() => {
    if (id) loadAccountState();
  }, [id, isLoggedIn, token]);

  const toggleFav = async () => {
    if (isLoggedIn) {
      setIsFav((v) => !v);
      try {
        await fetch(`${API}/users/favourites/${id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to update favourite:", err);
      }
    } else {
      const favs = loadGuestFavourites();
      favs.has(id) ? favs.delete(id) : favs.add(id);
      localStorage.setItem("favourites", JSON.stringify([...favs]));
      setIsFav(favs.has(id));
    }
  };

  const addToDay = async () => {
    const protein = recipeDetails.nutrition?.protein || 0;
    const calories = recipeDetails.nutrition?.calories || 0;
    const carbs = recipeDetails.nutrition?.carbs || 0;
    const fats = recipeDetails.nutrition?.fats || 0;

    if (isLoggedIn) {
      try {
        await fetch(`${API}/users/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipe: id,
            title: recipeDetails.title,
            protein, calories, carbs, fats,
            serving: recipeDetails.cookingTime || "",
          }),
        });
        loadAccountState();
      } catch (err) {
        console.error("Failed to log meal:", err);
      }
    } else {
      const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]");
      added.push({ id, protein, date: new Date().toISOString() });
      localStorage.setItem("proteinAdded", JSON.stringify(added));
      loadAccountState();
    }
    window.dispatchEvent(new Event("proteinUpdate"));
  };

  const removeFromDay = async () => {
    if (isLoggedIn) {
      const entryId = todayEntryIds[todayEntryIds.length - 1];
      if (!entryId) return;
      try {
        await fetch(`${API}/users/history/${entryId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        loadAccountState();
      } catch (err) {
        console.error("Failed to remove meal:", err);
      }
    } else {
      const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]");
      const idx = [...added].reverse().findIndex((a) => a.id === id && isToday(a.date));
      if (idx !== -1) {
        added.splice(added.length - 1 - idx, 1);
        localStorage.setItem("proteinAdded", JSON.stringify(added));
      }
      loadAccountState();
    }
    window.dispatchEvent(new Event("proteinUpdate"));
  };

  const base = recipeDetails.nutrition || {};

  const n = {
    calories: scale(base.calories, servings),
    protein:  scale(base.protein,  servings),
    carbs:    scale(base.carbs,    servings),
    fats:     scale(base.fats,     servings),
    fiber:    scale(base.fiber,    servings),
    sugar:    scale(base.sugar,    servings),
    sodium:   scale(base.sodium,   servings),
    vitamins: base.vitamins,
  };

  const macros = [
  { label: "Protein", value: n.protein, daily: 50,  unit: "g", color: "#c9943a", icon: "💪" },
  { label: "Carbs",   value: n.carbs,   daily: 300, unit: "g", color: "#4caf50", icon: "🌾" },
  { label: "Fats",    value: n.fats,    daily: 65,  unit: "g", color: "#1c2340", icon: "🥑" },
  { label: "Fiber",   value: n.fiber,   daily: 30,  unit: "g", color: "#2196f3", icon: "🌿" },
];
  if (!recipeDetails.title) return null;

  return (
    <div className="rd-page">
      <button onClick={() => navigate(-1)} className="rd-back-btn">← Back</button>

      <div className="rd-hero-backdrop">
  <div className="rd-backdrop-blob rd-blob-1" />
  <div className="rd-backdrop-blob rd-blob-2" />
  <div className="rd-hero">
        <div className="rd-hero-img-wrap">
          <img src={recipeDetails.image} alt={recipeDetails.title} className="rd-hero-img" />
          <button
            className="rd-fav-btn"
            onClick={toggleFav}
            aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            {isFav ? "❤️" : "🤍"}
          </button>
        </div>

        <div className="rd-hero-info">
          {recipeDetails.tags && recipeDetails.tags.length > 0 && (
            <div className="rd-tags">
              {recipeDetails.tags.map((t) => <span key={t} className="rd-tag">{t}</span>)}
            </div>
          )}

          <h1 className="rd-title">{recipeDetails.title}</h1>
          <p className="rd-description">{recipeDetails.description}</p>

          <div className="rd-serving-row">
            <span className="rd-serving-label">Servings:</span>
            <div className="rd-serving-btns">
              {SERVING_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setServings(s)}
                  className={`rd-serving-btn${servings === s ? " active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {servings > 1 && <span className="rd-serving-note">× {servings} multiplied</span>}
          </div>

          <div className="rd-stats-row">
            <div className="rd-stat-box">
              <span className="rd-stat-value">{n.calories || "—"}</span>
              <span className="rd-stat-label">Calories</span>
            </div>
            <div className="rd-stat-box">
              <span className="rd-stat-value">{n.protein ? n.protein + "g" : "—"}</span>
              <span className="rd-stat-label">Protein</span>
            </div>
            <div className="rd-stat-box">
              <span className="rd-stat-value">{n.carbs ? n.carbs + "g" : "—"}</span>
              <span className="rd-stat-label">Carbs</span>
            </div>
            <div className="rd-stat-box">
              <span className="rd-stat-value">{n.fats ? n.fats + "g" : "—"}</span>
              <span className="rd-stat-label">Fats</span>
            </div>
          </div>

          <div className="rd-cooking-time">⏱ Cooking Time: <strong>{recipeDetails.cookingTime}</strong></div>

          {todayQty > 0 ? (
            <div className="rd-added-row">
              <button className="rd-qty-btn" onClick={removeFromDay}>−</button>
              <span className="rd-added-label">✓ Added to today ({todayQty})</span>
              <button className="rd-qty-btn" onClick={addToDay}>+</button>
            </div>
          ) : (
            <button className="rd-add-btn" onClick={addToDay}>+ Add to My Day</button>
          )}
        </div>
      </div>
      </div>

      <div className="rd-two-col">
        <div className="rd-card">
  <h3 className="rd-card-title">📋 Steps</h3>
  <ol className="rd-steps-list">
    {recipeDetails.steps?.map((step, i) => (
      <li key={i} className="rd-step-item">
        <span className="rd-step-num">{i + 1}</span>
        <span className="rd-step-text">{step}</span>
      </li>
    ))}
  </ol>
</div>

        <div className="rd-card">
  <h3 className="rd-card-title">🥗 Ingredients</h3>
  <ul className="rd-ingredients-list">
    {recipeDetails.ingredients?.map((ing, i) => (
      <li key={i} className="rd-ingredient-item">
        <span className="rd-ingredient-check">✓</span> {ing}
      </li>
    ))}
  </ul>
</div>
 </div>

      {recipeDetails.nutrition && (
        <div className="rd-nutrition-section">
          <h3 className="rd-nutrition-title">
            🥦 Nutrition Facts
            <span className="rd-per-serving">{servings === 1 ? "per serving" : `for ${servings} servings`}</span>
          </h3>

          <div className="rd-macro-grid">
            {macros.map((m) => {
  const pct = Math.min(Math.round((m.value / m.daily) * 100), 100);
  return (
    <div key={m.label} className="rd-macro-card" style={{ borderColor: m.color + "40" }}>
      <div className="rd-macro-icon-wrap" style={{ background: m.color + "18" }}>
        <span>{m.icon}</span>
      </div>
      <div className="rd-macro-top">
        <span className="rd-macro-label">{m.label}</span>
        <span className="rd-macro-value" style={{ color: m.color }}>{m.value}{m.unit}</span>
      </div>
      <div className="rd-bar-bg">
        <div className="rd-bar-fill" style={{ width: pct + "%", backgroundColor: m.color }} />
      </div>
      <span className="rd-pct-text">{pct}% daily value</span>
    </div>
  );
})}
          </div>

          <div className="rd-micro-row">
            <div className="rd-micro-item">
              <span className="rd-micro-label">Sugar</span>
              <span className="rd-micro-val">{n.sugar}g</span>
            </div>
            <div className="rd-micro-item">
              <span className="rd-micro-label">Sodium</span>
              <span className="rd-micro-val">{n.sodium}mg</span>
            </div>
            <div className="rd-micro-item">
              <span className="rd-micro-label">Fiber</span>
              <span className="rd-micro-val">{n.fiber}g</span>
            </div>
            {n.vitamins && (
              <div className="rd-micro-item" style={{ flex: 2 }}>
                <span className="rd-micro-label">Key Vitamins</span>
                <span className="rd-micro-val">{n.vitamins}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeDetails;