import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">⚡</span>
              XpressConvert
            </Link>
            <p className="footer-description">
              La herramienta definitiva para convertir, comprimir y optimizar tus archivos de forma rápida y segura.
            </p>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-title">Herramientas</h4>
            <ul>
              <li><Link to="/convertir-imagenes">Convertir Imágenes</Link></li>
              <li><Link to="/comprimir">Comprimir</Link></li>
              <li><Link to="/redimensionar">Redimensionar</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-title">Empresa</h4>
            <ul>
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Contacto</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-title">Legal</h4>
            <ul>
              <li><a href="#">Términos de Servicio</a></li>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 XpressConvert. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
