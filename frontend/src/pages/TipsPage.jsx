const TIPS = [
  {
    emoji: "🥗",
    title: "Use Multiple Protein Sources",
    desc: "Combine legumes (like lentils or chickpeas) with whole grains (like brown rice or quinoa) to get a complete amino acid profile in vegetarian meals.",
  },
  {
    emoji: "🍱",
    title: "Cook in Bulk & Meal Prep",
    desc: "Batch-cook beans, quinoa, or tofu at the start of the week. This saves time and encourages consistent healthy eating throughout the week.",
  },
  {
    emoji: "🧄",
    title: "Marinate for Maximum Flavour",
    desc: "Use simple marinades with lemon, olive oil, garlic, and spices for at least 30 minutes to boost flavour without adding extra calories.",
  },
  {
    emoji: "🔥",
    title: "Roast Instead of Fry",
    desc: "Roasting chickpeas, veggies, or paneer in the oven helps retain nutrients and cuts down on oil, making the meal lighter and more nutritious.",
  },
  {
    emoji: "🌰",
    title: "Add Seeds & Nuts",
    desc: "Sprinkle chia seeds, hemp seeds, almonds, or pumpkin seeds on salads, soups, or curries to add crunch and a natural protein boost.",
  },
  {
    emoji: "🌱",
    title: "Sprout & Ferment Your Ingredients",
    desc: "Sprouting beans like mung or black chana increases protein bioavailability and improves digestion. Fermented foods also support gut health.",
  },
  {
    emoji: "🥛",
    title: "Swap in Greek Yogurt",
    desc: "Use Greek yogurt or hung curd as a base for sauces or dips. It adds creaminess and significantly boosts protein without adding extra fat.",
  },
  {
    emoji: "⏱️",
    title: "Don't Overcook Your Proteins",
    desc: "Overcooking eggs, tofu, or paneer makes them rubbery. Cook just until set to preserve their texture, flavour, and nutritional value.",
  },
  {
    emoji: "🥑",
    title: "Balance with Healthy Fats & Fibre",
    desc: "Adding avocado, olive oil, or fibrous veggies like spinach improves satiety and digestion alongside your protein intake.",
  },
  {
    emoji: "🫙",
    title: "Experiment with Spices",
    desc: "Use turmeric, cumin, smoked paprika, and fresh herbs to elevate flavours naturally — no extra salt or processed sauces needed.",
  },
];

function TipsPage() {
  return (
    <div className="tips-page">
      <div className="tips-header">
        <p className="tips-label">Knowledge</p>
        <h1 className="tips-title">Cooking Tips & Tricks</h1>
        <p className="tips-subtitle">
          Simple, science-backed techniques to get the most protein and flavour out of every meal.
        </p>
      </div>

      <div className="tips-grid">
        {TIPS.map((tip, i) => (
          <div className="tip-card" key={i}>
            <div className="tip-emoji">{tip.emoji}</div>
            <div className="tip-body">
              <h3 className="tip-title">{tip.title}</h3>
              <p className="tip-desc">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TipsPage;
