import { Link } from "react-router-dom"

function HeroSection({ recipes }) {
  const firstRecipe = recipes && recipes[0]
  const recipeCount = recipes?.length || 0
  const avgProtein = recipes && recipes.length > 0
    ? Math.round(recipes.reduce((sum, r) => sum + (r.nutrition?.protein || 0), 0) / recipes.length)
    : 0

  return (
    <section className="premium-hero">
      <div className="hero-content">
        <div className="hero-badge">✦ New Recipes Added Weekly</div>
        <h1 className="hero-title">
          Fuel Your Body<br />
          <span className="hero-title-accent">With Purpose.</span>
        </h1>
        <p className="hero-subtitle">
          Plan high-protein meals, track your macros, and discover chef-crafted recipes — all in one beautifully designed space.
        </p>
        <div className="hero-actions">
          <Link to="/recipes" className="hero-btn-primary">Start Exploring →</Link>
          <Link to="/planner" className="hero-btn-secondary">Meal Planner</Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-icon">🍽</span>
            <div className="hero-stat-text">
              <span className="hero-stat-num">{recipeCount}+</span>
              <span className="hero-stat-label">Recipes</span>
            </div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-icon">💪</span>
            <div className="hero-stat-text">
              <span className="hero-stat-num">{avgProtein}g</span>
              <span className="hero-stat-label">Avg Protein</span>
            </div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-icon">⭐</span>
            <div className="hero-stat-text">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Whole Foods</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-image">
        {firstRecipe && (
          <Link to={`/recipe/${firstRecipe.id}`}>
            <img src={firstRecipe.image} alt={firstRecipe.title} />
            <div className="hero-featured-card">
              <span className="hero-featured-label">Featured Recipe</span>
              <h3 className="hero-featured-title">{firstRecipe.title}</h3>
              <p className="hero-featured-meta">
                <span>⏱ {firstRecipe.cookingTime}</span>
                {firstRecipe.nutrition?.protein && (
                  <span> · {firstRecipe.nutrition.protein}g protein</span>
                )}
              </p>
            </div>
          </Link>
        )}
      </div>
    </section>
  )
}

export default HeroSection
