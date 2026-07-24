import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Home from "./components/Home"
import About from "./components/About"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import RecipesPage from "./pages/RecipesPage"
import TipsPage from "./pages/TipsPage"
import ContactUsPage from "./pages/ContactUsPage"
import ShareRecipePage from "./pages/ShareRecipePage"
import RecipeDetails from "./components/RecipeDetails"
import ScrollToTop from "./components/ScrollToTop"
import MealPlannerPage from "./pages/MealPlannerPage"
import './App.css'
import BMICalculator from './components/BMICalculator.jsx'
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ProfilePage from "./pages/ProfilePage"
import ProtectedRoute from "./components/ProtectedRoute"

function RouteScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [pathname])
  return null
}

function App() {
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/recipes`)
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((r) => ({ ...r, id: r._id }))
        setRecipes(normalized)
      })
      .catch((err) => console.error("Failed to fetch recipes:", err))
  }, [])

  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Navbar />
      <Routes>
        <Route path='/' element={<>
          <Home recipes={recipes} />
          <BMICalculator />
        </>} />
        <Route path='/about' element={<About />} />
        <Route path='/recipe/:id' element={<RecipeDetails recipes={recipes} />} />
        <Route path="/recipes" element={<RecipesPage recipes={recipes} />} />
        <Route path="/tips" element={<TipsPage />} />
        <Route path="/planner" element={<MealPlannerPage recipes={recipes} />} />
        <Route path="/share" element={<ShareRecipePage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "120px 24px" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "64px", color: "var(--navy)" }}>404</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Page not found.</p>
            <a href="/" style={{ color: "var(--gold)", fontWeight: 600 }}>← Go Home</a>
          </div>
        } />
      </Routes>
      <Footer />
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </BrowserRouter>
  )
}

export default App