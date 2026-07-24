import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  fiber: Number,
  sugar: Number,
  sodium: Number,
  vitamins: String,
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: [String],
  steps: [String],
  image: String,
  cookingTime: String,
  nutrition: nutritionSchema,
  tags: [String],
}, { timestamps: true });

export default mongoose.model("Recipe", recipeSchema);