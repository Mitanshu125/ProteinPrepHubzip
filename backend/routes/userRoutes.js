import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET current user's full profile (goal, saved recipes, history)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("savedRecipes");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE protein goal
router.put("/goal", protect, async (req, res) => {
  try {
    const { proteinGoal } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { proteinGoal },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// TOGGLE a favourite recipe (add if not saved, remove if already saved)
router.post("/favourites/:recipeId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { recipeId } = req.params;

    const isSaved = user.savedRecipes.some((id) => id.toString() === recipeId);

    if (isSaved) {
      user.savedRecipes = user.savedRecipes.filter((id) => id.toString() !== recipeId);
    } else {
      user.savedRecipes.push(recipeId);
    }

    await user.save();
    res.json({ savedRecipes: user.savedRecipes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ADD a meal to history (also used for "Add to My Day")
router.post("/history", protect, async (req, res) => {
  try {
    const { recipe, title, protein, calories, carbs, fats, serving } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { mealHistory: { recipe, title, protein, calories, carbs, fats, serving } } },
      { new: true }
    ).select("mealHistory");

    res.json({ mealHistory: user.mealHistory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE one specific meal entry (used by the "-" button)
router.delete("/history/:entryId", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { mealHistory: { _id: req.params.entryId } } },
      { new: true }
    ).select("mealHistory");
    res.json({ mealHistory: user.mealHistory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;