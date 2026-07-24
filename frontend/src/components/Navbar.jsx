import { Link, useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const location = useLocation()

  const { user, isLoggedIn, logout } = useAuth()
const navigate = useNavigate()

const handleLogout = () => {
  logout()
  navigate("/")
}

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/recipes", label: "Recipes" },
    { to: "/tips", label: "Tips" },
    { to: "/planner", label: "Meal Planner" },
    { to: "/share", label: "Share" },
  ]

  return (
    <nav className="premium-nav">
      <Link to="/" className="nav-logo">
        <div className="logo-icon">
          <Logo />
        </div>
        <span className="logo-text">ProteinPrep<span className="logo-accent">Hub</span></span>
      </Link>

      <ul className="nav-links">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              style={location.pathname === to ? { color: "#c8893a" } : {}}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-right">
  {isLoggedIn ? (
    <Link to="/profile" className="nav-user-pill">
  <span className="nav-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
  <span>{user.name.split(" ")[0]}</span>
</Link>
  ) : (
    <div className="nav-auth-links">
      <Link to="/login" className="nav-login-link">Log In</Link>
      <Link to="/signup" className="nav-signup-link">Sign Up</Link>
    </div>
  )}
</div>
    </nav>
  )
}

function Logo({ size = 36, bgFill = "#c8893a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill={bgFill} />
      {/* Exact Tabler barbell — bigger scale, rotated 45deg */}
      <g transform="translate(20,20) rotate(45) scale(1.05) translate(-12,-12)">
        <path d="M2 12h1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 8h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12h6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 12h-1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  )
}

export { Logo }
export default Navbar