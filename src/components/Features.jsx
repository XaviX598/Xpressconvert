import './Features.css'

const features = [
  {
    icon: 'speed',
    title: 'Ultra Rápido',
    description: 'Procesa tus archivos en segundos con nuestra tecnología optimizada'
  },
  {
    icon: 'security',
    title: '100% Seguro',
    description: 'Tus archivos se procesan localmente y se eliminan automáticamente'
  },
  {
    icon: 'device',
    title: 'Multi Dispositivo',
    description: 'Accede desde cualquier dispositivo: PC, tablet o móvil'
  },
  {
    icon: 'free',
    title: 'Totalmente Gratis',
    description: 'Sin límites, sin registros, sin costos ocultos'
  }
]

function getIcon(iconName) {
  const icons = {
    speed: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    security: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    device: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    free: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    )
  }
  return icons[iconName] || icons.speed
}

function Features() {
  return (
    <section className="features-section" id="caracteristicas">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title animate-slide-up">¿Por qué elegirnos?</h2>
          <p className="section-subtitle animate-slide-up">
            La mejor experiencia para convertir y optimizar tus archivos
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon">
                {getIcon(feature.icon)}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
