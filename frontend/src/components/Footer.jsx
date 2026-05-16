import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa6"
import { Link } from "react-router-dom"
import { Logo } from "./Navbar"

function Footer() {
  return (
    <footer className="premium-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Logo size={34} bgFill="#c8893a" leafFill="#1a1a2e" />
            <span>ProteinPrep<span style={{ color: "#c8893a" }}>Hub</span></span>
          </div>
          <p className="footer-desc">A premium destination for high-protein meal planning, nutrition tracking, and chef-crafted recipes. Fuel your life with purpose.</p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/mitanshu_khichi/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://www.linkedin.com/in/mitanshu-khichi-b62a59215/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href="https://github.com/Mitanshu125" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Discover</h4>
            <Link to="/recipes">All Recipes</Link>
            <Link to="/planner">Meal Planner</Link>
            <Link to="/tips">Cooking Tips</Link>
          </div>
          <div className="footer-col">
            <h4>Tools</h4>
            <a href="/#tracker-section" onClick={e => { e.preventDefault(); window.location.pathname !== '/' ? (window.location.href = '/#tracker-section') : document.getElementById('tracker-section')?.scrollIntoView({ behavior: 'smooth' }) }}>Protein Tracker</a>
            <a href="/#bmi-section" onClick={e => { e.preventDefault(); window.location.pathname !== '/' ? (window.location.href = '/#bmi-section') : document.getElementById('bmi-section')?.scrollIntoView({ behavior: 'smooth' }) }}>BMI Calculator</a>
            <Link to="/share">Share Recipe</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ProteinPrepHub.</p>
      </div>
    </footer>
  )
}

export default Footer