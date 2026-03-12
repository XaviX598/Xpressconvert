import { useState, useRef, useEffect } from 'react'
import './Converter.css'

const presets = [
  { label: 'Instagram Square', width: 1080, height: 1080 },
  { label: 'Instagram Story', width: 1080, height: 1920 },
  { label: 'Facebook Cover', width: 820, height: 312 },
  { label: 'Twitter Post', width: 1200, height: 675 },
  { label: 'YouTube Thumbnail', width: 1280, height: 720 },
  { label: 'HD', width: 1920, height: 1080 },
  { label: '4K', width: 3840, height: 2160 }
]

function ImageResizer() {
  const [files, setFiles] = useState([])
  const [targetWidth, setTargetWidth] = useState(1920)
  const [targetHeight, setTargetHeight] = useState(1080)
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [originalDimensions, setOriginalDimensions] = useState(null)
  const [resizing, setResizing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (maintainAspect && originalDimensions && originalDimensions.width) {
      const ratio = originalDimensions.width / originalDimensions.height
      setTargetHeight(Math.round(targetWidth / ratio))
    }
  }, [targetWidth, maintainAspect, originalDimensions])

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'))
    setFiles(validFiles)
    setCompleted(false)
    setResults([])
    
    if (validFiles.length > 0) {
      const img = new Image()
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height })
        setTargetWidth(img.width)
        setTargetHeight(img.height)
      }
      img.src = URL.createObjectURL(validFiles[0])
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setCompleted(false)
    setResults([])
  }

  const resizeImage = async (file, width, height) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const ext = file.name.split('.').pop()
            const baseName = file.name.replace(/\.[^/.]+$/, '')
            resolve({
              originalName: file.name,
              resizedName: `${baseName}_${width}x${height}.${ext}`,
              originalSize: file.size,
              resizedSize: blob.size,
              url: URL.createObjectURL(blob),
              width,
              height,
              blob
            })
          } else {
            reject(new Error('Error al redimensionar'))
          }
        }, 'image/jpeg', 0.92)
      }

      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleResize = async () => {
    if (files.length === 0) return
    
    setResizing(true)
    setResults([])
    
    try {
      const resizedResults = await Promise.all(
        files.map(file => resizeImage(file, targetWidth, targetHeight))
      )
      setResults(resizedResults)
      setCompleted(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setResizing(false)
    }
  }

  const downloadFile = (result) => {
    const link = document.createElement('a')
    link.href = result.url
    link.download = result.resizedName
    link.click()
  }

  const downloadAll = () => {
    results.forEach(result => downloadFile(result))
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const applyPreset = (preset) => {
    setTargetWidth(preset.width)
    setTargetHeight(preset.height)
  }

  return (
    <div className="converter-page">
      <div className="converter-container">
        <div className="converter-header">
          <h1>Redimensionar Imágenes</h1>
          <p>Cambia el tamaño de tus imágenes rápidamente</p>
        </div>

        <div className="converter-content">
          <div 
            className={`drop-zone ${files.length > 0 ? 'has-files' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              hidden
            />
            <div className="drop-zone-content">
              <div className="drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9"/>
                  <polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              </div>
              <h3>Arrastra tus imágenes aquí</h3>
              <p>o haz clic para seleccionar</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="files-list">
              <div className="files-header">
                <h3>Archivos seleccionados ({files.length})</h3>
                <button className="clear-btn" onClick={() => { setFiles([]); setResults([]); setCompleted(false) }}>
                  Limpiar todo
                </button>
              </div>
              <div className="files-grid">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <img src={URL.createObjectURL(file)} alt={file.name} />
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatSize(file.size)}</span>
                    </div>
                    <button className="remove-btn" onClick={() => removeFile(index)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && !completed && (
            <div className="convert-options">
              <div className="format-selector">
                <label>Dimensiones objetivo</label>
                
                {originalDimensions && (
                  <div className="original-dimensions">
                    Original: {originalDimensions.width} x {originalDimensions.height} px
                  </div>
                )}
                
                <div className="dimensions-inputs">
                  <div className="dimension-input">
                    <label>Ancho (px)</label>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => setTargetWidth(Number(e.target.value))}
                    />
                  </div>
                  <span className="dimension-separator">x</span>
                  <div className="dimension-input">
                    <label>Alto (px)</label>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => setTargetHeight(Number(e.target.value))}
                    />
                  </div>
                </div>

                <label className="aspect-checkbox">
                  <input
                    type="checkbox"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                  />
                  Mantener proporción
                </label>
              </div>

              <div className="presets-section">
                <label>Preajustes</label>
                <div className="presets-grid">
                  {presets.map((preset, index) => (
                    <button
                      key={index}
                      className={`preset-btn ${targetWidth === preset.width && targetHeight === preset.height ? 'active' : ''}`}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                      <span>{preset.width}x{preset.height}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="convert-btn"
                onClick={handleResize}
                disabled={resizing}
              >
                {resizing ? (
                  <>
                    <span className="spinner"></span>
                    Redimensionando...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 3 21 3 21 9"/>
                      <polyline points="9 21 3 21 3 15"/>
                    </svg>
                    Redimensionar {files.length > 1 ? `${files.length} archivos` : 'imagen'}
                  </>
                )}
              </button>
            </div>
          )}

          {completed && results.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Redimensión completada
                </h3>
                <button className="download-all-btn" onClick={downloadAll}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar todo
                </button>
              </div>
              
              <div className="results-grid">
                {results.map((result, index) => (
                  <div key={index} className="result-card">
                    <div className="result-preview">
                      <img src={result.url} alt={result.resizedName} />
                    </div>
                    <div className="result-info">
                      <span className="result-name">{result.resizedName}</span>
                      <div className="result-dimensions">{result.width} x {result.height} px</div>
                      <div className="result-sizes">
                        <span className="original">{formatSize(result.originalSize)}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                        <span className="converted">{formatSize(result.resizedSize)}</span>
                      </div>
                    </div>
                    <button className="download-btn" onClick={() => downloadFile(result)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageResizer
