import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SERVING_OPTIONS = [1, 2, 4];

function scale(val, servings) {
  return val ? Math.round(val * servings * 10) / 10 : null;
}

function RecipeDetails({ recipes }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipeDetails, setRecipeDetails] = useState({});
  const [servings, setServings] = useState(1);

  useEffect(() => {
    const filteredRecipe = recipes.find((recipe) => recipe.id == id);
    if (filteredRecipe) { setRecipeDetails(filteredRecipe); setServings(1); }
  }, [id, recipes]);

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
    { label: "Protein", value: n.protein, daily: 50,  unit: "g",  color: "#1a1a2e" },
    { label: "Carbs",   value: n.carbs,   daily: 300, unit: "g",  color: "#4caf50" },
    { label: "Fats",    value: n.fats,    daily: 65,  unit: "g",  color: "#c8893a" },
    { label: "Fiber",   value: n.fiber,   daily: 30,  unit: "g",  color: "#2196f3" },
  ];

  return (
    recipeDetails.title && (
      <div style={styles.page}>

        {/* Top layout: image left, info right */}
        <div style={styles.topSection}>
          <div style={styles.imageWrapper}>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
            <img src={recipeDetails.image} alt={recipeDetails.title} style={styles.image} />
          </div>

          <div style={styles.infoPanel}>
            <h1 style={styles.title}>{recipeDetails.title}</h1>
            <p style={styles.description}>{recipeDetails.description}</p>

            {/* Serving size selector */}
            <div style={styles.servingRow}>
              <span style={styles.servingLabel}>Servings:</span>
              <div style={styles.servingBtns}>
                {SERVING_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setServings(s)}
                    style={{
                      ...styles.servingBtn,
                      ...(servings === s ? styles.servingBtnActive : {}),
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {servings > 1 && (
                <span style={styles.servingNote}>× {servings} multiplied</span>
              )}
            </div>

            {/* Quick stats row */}
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <span style={styles.statValue}>{n.calories || "—"}</span>
                <span style={styles.statLabel}>Calories</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statValue}>{n.protein ? n.protein + "g" : "—"}</span>
                <span style={styles.statLabel}>Protein</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statValue}>{n.carbs ? n.carbs + "g" : "—"}</span>
                <span style={styles.statLabel}>Carbs</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statValue}>{n.fats ? n.fats + "g" : "—"}</span>
                <span style={styles.statLabel}>Fats</span>
              </div>
            </div>

            <div style={styles.cookingTime}>
              ⏱ Cooking Time: <strong>{recipeDetails.cookingTime}</strong>
            </div>
          </div>
        </div>

        {/* Steps & Ingredients side by side */}
        <div style={styles.twoCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 Steps</h3>
            <ol style={styles.orderedList}>
              {recipeDetails.steps?.map((step, i) => (
                <li key={i} style={styles.listItem}>{step}</li>
              ))}
            </ol>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🥗 Ingredients</h3>
            <ul style={styles.unorderedList}>
              {recipeDetails.ingredients?.map((ing, i) => (
                <li key={i} style={styles.listItem}>
                  <span style={styles.dot}>•</span> {ing}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nutrition Section */}
        {recipeDetails.nutrition && (
          <div style={styles.nutritionSection}>
            <h3 style={styles.nutritionTitle}>
              🥦 Nutrition Facts
              <span style={styles.perServing}>
                {servings === 1 ? "per serving" : `for ${servings} servings`}
              </span>
            </h3>

            {/* Macro grid */}
            <div style={styles.macroGrid}>
              {macros.map((m) => {
                const pct = Math.min(Math.round((m.value / m.daily) * 100), 100);
                return (
                  <div key={m.label} style={styles.macroCard}>
                    <div style={styles.macroTop}>
                      <span style={styles.macroLabel}>{m.label}</span>
                      <span style={{ ...styles.macroValue, color: m.color }}>
                        {m.value}{m.unit}
                      </span>
                    </div>
                    <div style={styles.barBg}>
                      <div style={{ ...styles.barFill, width: Math.min(pct, 100) + "%", backgroundColor: m.color }} />
                    </div>
                    <span style={styles.pctText}>{pct}% daily value</span>
                  </div>
                );
              })}
            </div>

            {/* Micro nutrients row */}
            <div style={styles.microRow}>
              <div style={styles.microItem}>
                <span style={styles.microLabel}>Sugar</span>
                <span style={styles.microVal}>{n.sugar}g</span>
              </div>
              <div style={styles.microItem}>
                <span style={styles.microLabel}>Sodium</span>
                <span style={styles.microVal}>{n.sodium}mg</span>
              </div>
              <div style={styles.microItem}>
                <span style={styles.microLabel}>Fiber</span>
                <span style={styles.microVal}>{n.fiber}g</span>
              </div>
              {n.vitamins && (
                <div style={{ ...styles.microItem, flex: 2 }}>
                  <span style={styles.microLabel}>Key Vitamins</span>
                  <span style={styles.microVal}>{n.vitamins}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  );
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px 0 60px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  topSection: {
    display: "flex",
    gap: "40px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  imageWrapper: {
    flex: "1 1 400px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  backBtn: {
    alignSelf: "flex-start",
    background: "transparent",
    border: "2px solid #1a1a2e",
    color: "#1a1a2e",
    padding: "8px 18px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  image: {
    width: "100%",
    borderRadius: "20px",
    objectFit: "cover",
    aspectRatio: "4/3",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },
  infoPanel: {
    flex: "1 1 300px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    paddingTop: "10px",
  },
  title: {
    fontSize: "34px",
    fontWeight: "700",
    color: "#111",
    lineHeight: "1.2",
  },
  description: {
    fontSize: "17px",
    color: "#666",
    lineHeight: "1.6",
  },
  servingRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  servingLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  servingBtns: {
    display: "flex",
    gap: "8px",
  },
  servingBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "2px solid #e0e0e0",
    background: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    color: "#555",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
    transition: "all 0.2s",
  },
  servingBtnActive: {
    border: "2px solid #1a1a2e",
    background: "#1a1a2e",
    color: "#fff",
  },
  servingNote: {
    fontSize: "13px",
    color: "#1a1a2e",
    fontWeight: "600",
    background: "#f5f0ea",
    padding: "4px 12px",
    borderRadius: "20px",
    border: "1px solid #ddd6ca",
  },
  statsRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  statBox: {
    flex: "1 1 70px",
    background: "#f5f0ea",
    border: "2px solid #ddd6ca",
    borderRadius: "14px",
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cookingTime: {
    fontSize: "16px",
    color: "#555",
    background: "#f5f0ea",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid #ddd6ca",
  },
  twoCol: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 300px",
    background: "#fff",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111",
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "2px solid #ddd6ca",
  },
  orderedList: {
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  unorderedList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: 0,
  },
  listItem: {
    fontSize: "16px",
    color: "#444",
    lineHeight: "1.5",
  },
  dot: {
    color: "#c8893a",
    fontWeight: "bold",
    marginRight: "6px",
  },
  nutritionSection: {
    background: "#fff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
  },
  nutritionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  perServing: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#888",
  },
  macroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  macroCard: {
    background: "#fdfaf7",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  macroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  macroValue: {
    fontSize: "20px",
    fontWeight: "700",
  },
  barBg: {
    background: "#e8e8e8",
    borderRadius: "10px",
    height: "10px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },
  pctText: {
    fontSize: "12px",
    color: "#888",
  },
  microRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    borderTop: "2px solid #ddd6ca",
    paddingTop: "20px",
  },
  microItem: {
    flex: "1 1 100px",
    background: "#fdfaf7",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  microLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  microVal: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
  },
};

export default RecipeDetails;
