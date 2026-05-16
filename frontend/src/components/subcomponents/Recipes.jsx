import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

function ProteinBar() {
  const [proteinConsumed, setProteinConsumed] = useState(
    () => parseInt(localStorage.getItem("proteinConsumed") || "0")
  )
  const [proteinGoal] = useState(
    () => parseInt(localStorage.getItem("proteinGoal") || "160")
  )

  useEffect(() => {
    const handler = () =>
      setProteinConsumed(parseInt(localStorage.getItem("proteinConsumed") || "0"))
    window.addEventListener("proteinUpdate", handler)
    return () => window.removeEventListener("proteinUpdate", handler)
  }, [])

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

function loadFavourites() {
  try { return new Set(JSON.parse(localStorage.getItem("favourites") || "[]")); }
  catch { return new Set(); }
}

function addToDay(e, element) {
  e.preventDefault();
  e.stopPropagation();
  const protein = element.nutrition?.protein || 0;
  const prev = parseInt(localStorage.getItem("proteinConsumed") || "0");
  const added = JSON.parse(localStorage.getItem("proteinAdded") || "[]");
  added.push(element.id);
  localStorage.setItem("proteinConsumed", String(prev + protein));
  localStorage.setItem("proteinAdded", JSON.stringify(added));
  window.dispatchEvent(new Event("proteinUpdate"));
}

function Recipes({recipes}) {
  const [query, setQuery] = useState("");
  const [calFilter, setCalFilter] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [activeTags, setActiveTags] = useState([]);
  const [showFavs, setShowFavs] = useState(false);
  const [favourites, setFavourites] = useState(loadFavourites);

  const toggleFav = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("favourites", JSON.stringify([...next]));
      return next;
    });
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
              <Card key={index} element={element} favourites={favourites} toggleFav={toggleFav} />
            ))}
          </section>
        </>
      ) : (
        <>
          <section className="container">
            {recipes.slice(0,8).map((element, index) => (
              <Card key={index} element={element} favourites={favourites} toggleFav={toggleFav} />
            ))}
          </section>

          <h3>Recommended Recipes</h3>

          <section className="container">
            {recipes.slice(8,16).map((element, index) => (
              <Card key={index} element={element} favourites={favourites} toggleFav={toggleFav} />
            ))}
          </section>
        </>
      )}

    </article>
    </>
  )
}

export default Recipes

function Card({ element, favourites, toggleFav }) {
  const n = element.nutrition;
  const isFav = favourites.has(element.id);
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
          {element.tags.map((t) => <span key={t} className="card-tag">{t}</span>)}
        </div>
      )}
      {n && (
        <div className="card-mini-stats">
          <span className="mini-stat">🔥 {n.calories} cal</span>
          <span className="mini-stat">💪 {n.protein}g</span>
          <span className="mini-stat">🌾 {n.carbs}g carbs</span>
        </div>
      )}
      <button
        className="add-to-day-btn"
        onClick={(e) => addToDay(e, element)}
      >
        + Add to My Day
      </button>
    </Link>
  );
}
