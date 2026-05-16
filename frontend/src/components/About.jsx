import { Link } from "react-router-dom";

const FEATURES = [
  {
    emoji: "🥗",
    title: "Healthy Recipes",
    desc: "17 handpicked meals built for flavour, nutrition, and ease — ready in 30 minutes or less.",
  },
  {
    emoji: "💪",
    title: "Protein Focused",
    desc: "Every recipe is designed around high-quality protein to fuel your workouts and daily life.",
  },
  {
    emoji: "🌱",
    title: "Plant Based",
    desc: "Mostly vegetarian and plant-forward — lentils, chickpeas, tofu, paneer, quinoa and more.",
  },
];

function About() {
  return (
    <div className="about-page">

      {/* Hero banner */}
      <section className="about-hero">
        <h1>About ProteinPrepHub</h1>
        <p>Your go-to platform for high-protein, plant-forward recipes that taste as good as they fuel you.</p>
        <Link to="/recipes" className="about-hero-btn">Browse Recipes →</Link>
      </section>

      {/* 3 feature cards */}
      <section className="about-features">
        {FEATURES.map((f) => (
          <div className="about-feature-card" key={f.title}>
            <span className="about-feature-emoji">{f.emoji}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Mission — 2 col layout */}
      <section className="about-mission">
        <div className="about-mission-img">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
            alt="Healthy food spread"
          />
        </div>
        <div className="about-mission-text">
          <span className="about-mission-label">Our Mission</span>
          <h2>Eat Smart.<br />Train Hard.<br />Track Better.</h2>
          <p>
            We built ProteinPrepHub to prove that high-protein eating doesn't have to be boring or
            meat-heavy. From quick weekday lunches to post-workout dinners, every recipe here is
            crafted to keep you fuelled, satisfied, and on track.
          </p>
          <ul className="about-mission-list">
            <li>✅ Wholesome ingredients — fresh, clean and nutritious</li>
            <li>✅ Clear nutrition info on every recipe</li>
            <li>✅ Track your daily protein goal in real time</li>
          </ul>
        </div>
      </section>

    </div>
  );
}

export default About;
