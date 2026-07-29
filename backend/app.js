import { connectDB } from "./config/db.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import express from "express";
import cors from "cors";
import "dotenv/config"
import { sendEmail } from "./utils/sendEmail.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const router = express.Router();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the DB connection is ready (or reused from cache) before any
// route handler runs. On a warm invocation this resolves instantly
// because connectDB() returns the cached connection.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ success: false, message: "Database unavailable, please try again." });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running")
})

router.post("/send/mail", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Please provide all details",
    });
  }
  try {
    await sendEmail({
      email: process.env.SMTP_MAIL,
      subject: `New Message from ${name} - ProteinPrepHub`,
      message,
      userEmail: email,
    });
    res.status(200).json({
      success: true,
      message: "Message Sent Successfully.",
    });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.use("/recipes", recipeRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use(router);

export default app;

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 4000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening at port ${PORT}`);
    });
  });
}