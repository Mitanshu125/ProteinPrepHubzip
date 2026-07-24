import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import Recipe from "./models/Recipe.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    const data = JSON.parse(fs.readFileSync("./seedData/recipes.json", "utf-8"));

    await Recipe.deleteMany();
    await Recipe.insertMany(data);

    console.log(`Seeded ${data.length} recipes successfully.`);
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seed();