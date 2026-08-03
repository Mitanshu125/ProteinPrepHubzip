import mongoose from "mongoose";

const mealHistorySchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
  title: String,
  protein: Number,
  calories: Number,
  carbs: Number,
  fats: Number,
  serving: String,
  loggedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  proteinGoal: { type: Number, default: 160 },
  savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  mealHistory: [mealHistorySchema],
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
}, { timestamps: true });

export default mongoose.model("User", userSchema);