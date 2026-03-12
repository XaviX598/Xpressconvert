import { Link } from 'react-router-dom'
import './ToolsGrid.css'

const tools = [
  {
    id: 1,
    icon: 'image',
    title: 'Convertir Imágenes',
    description: 'Convierte entre JPG, PNG, WEBP, GIF, BMP',
    link: '/convertir-imagenes',
    color: '#c9a962'
  },
  {
    id: 2,
    icon: 'compress',
    title: 'Comprimir',
    description: 'Reduce el tamaño de imágenes sin perder calidad',
    link: '/comprimir',
    color: '#22c55e'
  },
  {
    id: 3,
    icon: 'resize',
    title: 'Redimensionar',
    description: 'Cambia el tamaño de imágenes fácilmente',
    link: '/redimensionar',
    color: '#3b82f6'
  },
  {
    id: 4,
    icon: 'editor',
    title: 'Editor de Imagen',
    description: 'Recorta, rota y aplica filtros',
    link: '/editor',
    color: '#ec4899'
  },
  {
    id: 5,
    icon: 'pdf',
    title: 'Imágenes a PDF',
    description: 'Convierte imágenes a documento PDF',
    link: '/imagenes-a-pdf',
    color: '#ef4444'
  },
  {
    id: 6,
    icon: 'merge',
    title: 'Unir PDFs',
    description: 'Combina varios PDFs en uno',
    link: '/unir-pdfs',
    color: '#f97316'
  },
  {
    id: 7,
    icon: 'document',
    title: 'Documentos',
    description: 'Convierte entre PDF, TXT, DOCX',
    link: '/documentos',
    color: '#f59e0b'
  },
  {
    id: 8,
    icon: 'audio',
    title: 'Audio',
    description: 'Convierte entre MP3, WAV, OGG',
    link: '/audio',
    color: '#8b5cf6'
  },
  {
    id: 9,
    icon: 'video',
    title: 'Video',
    description: 'Convierte entre MP4, AVI, MKV',
    link: '/video',
    color: '#06b6d4'
  },
  {
    id: 10,
    icon: 'extract',
    title: 'Extraer Audio',
    description: 'Separa el audio de un video',
    link: '/extraer-audio',
    color: '#14b8a6'
  }
]

function getIcon(iconName) {
  const icons = {
    image: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    compress: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 14 10 14 10 20"/>
        <polyline points="20 10 14 10 14 4"/>
        <line x1="14" y1="10" x2="21" y2="3"/>
        <line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    ),
    resize: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 3 21 3 21 9"/>
        <polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/>
        <line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    ),
    editor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    pdf: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    merge: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    document: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    audio: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
    video: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/>
        <line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    extract: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
        <line x1="9" y1="22" x2="9" y2="18"/>
        <line x1="15" y1="22" x2="15" y2="18"/>
      </svg>
    )
  }
  return icons[iconName] || icons.image
}

function ToolsGrid() {
  return (
    <section className="tools-section" id="herramientas">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title animate-slide-up">Herramientas</h2>
          <p className="section-subtitle animate-slide-up">
            Todo lo que necesitas para trabajar con tus archivos
          </p>
        </div>
        
        <div className="tools-grid">
          {tools.map((tool, index) => (
            <Link 
              key={tool.id} 
              to={tool.link}
              className="tool-card"
              style={{ '--delay': `${index * 0.05}s`, '--color': tool.color }}
            >
              <div className="tool-card-inner">
                <div className="tool-icon" style={{ background: `${tool.color}15` }}>
                  <span style={{ color: tool.color }}>{getIcon(tool.icon)}</span>
                </div>
                <div className="tool-content">
                  <h3 className="tool-title">{tool.title}</h3>
                  <p className="tool-description">{tool.description}</p>
                </div>
                <div className="tool-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ToolsGrid
