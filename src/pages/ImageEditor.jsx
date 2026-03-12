import { useState, useRef, useEffect } from 'react'
import './Converter.css'

const filters = [
  { name: 'Normal', value: 'none' },
  { name: 'Grayscale', value: 'grayscale(100%)' },
  { name: 'Sepia', value: 'sepia(100%)' },
  { name: 'Invert', value: 'invert(100%)' },
  { name: 'Blur', value: 'blur(3px)' },
  { name: 'Brightness', value: 'brightness(150%)' },
  { name: 'Contrast', value: 'contrast(200%)' },
  { name: 'Saturate', value: 'saturate(200%)' },
  { name: 'Hue Rotate', value: 'hue-rotate(90deg)' }
]

const rotateAngles = [0, 90, 180, 270]

function ImageEditor() {
  const [image, setImage] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const [filter, setFilter] = useState('none')
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [cropMode, setCropMode] = useState(false)
  const [cropValues, setCropValues] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target.result)
        setOriginalImage(event.target.result)
        setFilter('none')
        setRotation(0)
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyEdits = () => {
    if (!originalImage) return

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      const radians = (rotation * Math.PI) / 180
      const sin = Math.abs(Math.sin(radians))
      const cos = Math.abs(Math.cos(radians))
      const newWidth = img.width * cos + img.height * sin
      const newHeight = img.width * sin + img.height * cos

      canvas.width = newWidth
      canvas.height = newHeight

      ctx.translate(newWidth / 2, newHeight / 2)
      ctx.rotate(radians)
      ctx.translate(-img.width / 2, -img.height / 2)

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filter}`
      ctx.drawImage(img, 0, 0)

      setImage(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.src = originalImage
  }

  useEffect(() => {
    if (originalImage) {
      applyEdits()
    }
  }, [filter, rotation, brightness, contrast, saturation])

  const handleRotate = (angle) => {
    setRotation((prev) => (prev + angle) % 360)
  }

  const handleReset = () => {
    setImage(originalImage)
    setFilter('none')
    setRotation(0)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
  }

  const handleDownload = () => {
    if (!image) return
    
    const link = document.createElement('a')
    link.download = 'edited-image.jpg'
    link.href = image
    link.click()
  }

  return (
    <div className="converter-page">
      <div className="converter-container">
        <div className="converter-header">
          <h1>Editor de Imágenes</h1>
          <p>Recorta, rota y aplica filtros a tus imágenes</p>
        </div>

        <div className="converter-content">
          {!image && (
            <div 
              className="drop-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                hidden
              />
              <div className="drop-zone-content">
                <div className="drop-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <h3>Selecciona una imagen</h3>
                <p>o arrastra y suelta</p>
                <span className="formats-hint">JPG, PNG, WEBP</span>
              </div>
            </div>
          )}

          {image && (
            <div className="editor-layout">
              <div className="editor-preview">
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <img 
                  src={image} 
                  alt="Preview" 
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filter}`,
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              </div>

              <div className="editor-controls">
                <div className="control-section">
                  <h4>Filtros</h4>
                  <div className="filter-grid">
                    {filters.map((f) => (
                      <button
                        key={f.name}
                        className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                        onClick={() => setFilter(f.value)}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-section">
                  <h4>Rotación</h4>
                  <div className="rotate-buttons">
                    <button onClick={() => handleRotate(-90)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                      </svg>
                      -90°
                    </button>
                    <button onClick={() => handleRotate(90)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                      </svg>
                      +90°
                    </button>
                  </div>
                </div>

                <div className="control-section">
                  <h4>Brillo: {brightness}%</h4>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="quality-slider"
                  />
                </div>

                <div className="control-section">
                  <h4>Contraste: {contrast}%</h4>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="quality-slider"
                  />
                </div>

                <div className="control-section">
                  <h4> Saturación: {saturation}%</h4>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="quality-slider"
                  />
                </div>

                <div className="editor-actions">
                  <button className="btn btn-secondary" onClick={handleReset}>
                    Restaurar
                  </button>
                  <button className="btn btn-primary" onClick={handleDownload}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Descargar
                  </button>
                </div>

                <button 
                  className="new-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Nueva imagen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageEditor
