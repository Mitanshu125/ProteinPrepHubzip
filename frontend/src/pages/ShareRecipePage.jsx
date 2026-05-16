import axios from "axios";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const ShareRecipePage = () => {
  const [recipeName, setRecipeName] = useState("");
  const [email, setEmail] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const message = `Recipe: ${recipeName}\nCooking Time: ${cookingTime}\nIngredients: ${ingredients}\nSteps: ${steps}`;
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send/mail`,
        { name: recipeName, email, message },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      setRecipeName(""); setEmail(""); setIngredients(""); setSteps(""); setCookingTime("");
      toast.success(data.message || "Recipe shared successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-page">
      <div className="share-card">
        <div className="share-card-header">
          <span className="section-badge">🍴 Community Recipes</span>
          <h2>Share Your Recipe</h2>
          <p>Have a delicious high-protein recipe? Share it with our community and inspire others to eat better.</p>
        </div>

        <form className="share-form" onSubmit={sendMail}>
          <div className="share-field">
            <label>Recipe Name</label>
            <input
              type="text"
              placeholder="e.g. Paneer Tikka Bowl"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              required
            />
          </div>

          <div className="share-field">
            <label>Your Email</label>
            <input
              type="text"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="share-field">
            <label>Cooking Time</label>
            <input
              type="text"
              placeholder="e.g. 20 mins"
              value={cookingTime}
              onChange={e => setCookingTime(e.target.value)}
              required
            />
          </div>

          <div className="share-field">
            <label>Ingredients</label>
            <textarea
              placeholder="List your ingredients, one per line..."
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="share-field">
            <label>Steps</label>
            <textarea
              placeholder="Describe the cooking steps..."
              value={steps}
              onChange={e => setSteps(e.target.value)}
              rows={6}
              required
            />
          </div>

          <button type="submit" className="share-submit-btn" disabled={loading}>
            {loading && <ClipLoader size={16} color="#ffffff" />}
            Share Recipe →
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShareRecipePage;
