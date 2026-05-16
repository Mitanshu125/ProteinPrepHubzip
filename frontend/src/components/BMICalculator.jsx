import { useState } from 'react';

const CATEGORIES = [
  { max: 18.5, label: "Underweight", color: "#3b82f6" },
  { max: 25,   label: "Normal",      color: "#22c55e" },
  { max: 30,   label: "Overweight",  color: "#f59e0b" },
  { max: Infinity, label: "Obese",   color: "#ef4444" },
];

function getCategory(bmi) {
  return CATEGORIES.find((c) => bmi < c.max);
}

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBMI] = useState(null);
  const [error, setError] = useState('');

  const calculate = () => {
    if (!height || !weight || Number(height) <= 0 || Number(weight) <= 0) {
      setError('Please enter a valid height and weight.');
      return;
    }
    setError('');
    const h = Number(height) / 100;
    setBMI((Number(weight) / (h * h)).toFixed(1));
  };

  const reset = () => { setBMI(null); setHeight(''); setWeight(''); setError(''); };

  const cat = bmi ? getCategory(Number(bmi)) : null;

  return (
    <div className="bmi-card" id="bmi-section">
      <div className="bmi-card-header">
        <h2 className="bmi-card-title">Check Your BMI</h2>
        <p className="bmi-card-sub">Understand your weight in relation to your height</p>
      </div>

      <div className="bmi-fields">
        <div className="bmi-field">
          <label>Height</label>
          <div className="bmi-input-wrap">
            <input
              type="number"
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && calculate()}
            />
            <span className="bmi-unit">cm</span>
          </div>
        </div>
        <div className="bmi-field">
          <label>Weight</label>
          <div className="bmi-input-wrap">
            <input
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && calculate()}
            />
            <span className="bmi-unit">kg</span>
          </div>
        </div>
      </div>

      {error && <p className="bmi-error">{error}</p>}

      <button className="bmi-calc-btn" onClick={calculate}>Calculate BMI</button>

      {bmi && cat ? (
        <div className="bmi-result-panel">
          <div className="bmi-number" style={{ color: cat.color }}>{bmi}</div>
          <div className="bmi-category-badge" style={{ background: cat.color + '1a', color: cat.color }}>
            {cat.label}
          </div>
          <p className="bmi-hint">
            {cat.label === "Normal"
              ? "Great job! You're within a healthy BMI range."
              : cat.label === "Underweight"
              ? "Consider increasing your caloric and protein intake."
              : cat.label === "Overweight"
              ? "A balanced diet and regular exercise can help."
              : "Consult a healthcare professional for personalised advice."}
          </p>
          <button className="bmi-reset-btn" onClick={reset}>Reset</button>
        </div>
      ) : (
        <div className="bmi-empty-state">
          <span className="bmi-empty-icon">⚖️</span>
          <p>Enter your height and weight above to see your BMI result.</p>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;