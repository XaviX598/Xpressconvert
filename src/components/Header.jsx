import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const toolsLinks = [
    { path: '/convertir-imagenes', label: 'Convertir' },
    { path: '/comprimir', label: 'Comprimir' },
    { path: '/redimensionar', label: 'Redimensionar' },
    { path: '/editor', label: 'Editor' },
    { path: '/unir-pdfs', label: 'Unir PDFs' },
    { path: '/imagenes-a-pdf', label: 'Img a PDF' }
  ]

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">XpressConvert</span>
        </Link>
        
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Inicio
          </Link>
          <div className="dropdown">
            <span className="nav-link dropdown-toggle">
              Herramientas
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
            <div className="dropdown-menu">
              {toolsLinks.map(link => (
                <Link key={link.path} to={link.path} className="dropdown-item">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/extraer-audio" className="nav-link">Extraer Audio</Link>
        </nav>

        <button 
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}

export default Header
