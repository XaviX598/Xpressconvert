import { Link } from 'react-router-dom'
import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-gradient"></div>
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--delay': `${i * 0.5}s`,
              '--x': `${Math.random() * 100}%`,
              '--duration': `${3 + Math.random() * 4}s`
            }}></div>
          ))}
        </div>
      </div>
      
      <div className="hero-content">
        <div className="hero-badge animate-fade-in">
          <span className="badge-dot"></span>
          Convierte archivos sin límites
        </div>
        
        <h1 className="hero-title animate-fade-in-up">
          Transforma tus archivos<br />
          <span className="gradient-text">Instantáneamente</span>
        </h1>
        
        <p className="hero-description animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          La herramienta todo-en-uno para convertir, comprimir y optimizar tus archivos. 
          Rápido, seguro y completamente gratis.
        </p>
        
        <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/convertir-imagenes" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Convertir Imágenes
          </Link>
          <Link to="/comprimir" className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="4 14 10 14 10 20"/>
              <polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Comprimir
          </Link>
        </div>

        <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="stat">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Archivos convertidos</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">9</span>
            <span className="stat-label">Herramientas</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">100%</span>
            <span className="stat-label">Gratis</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero
