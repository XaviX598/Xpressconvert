import { useState, useRef } from 'react'
import './Converter.css'

const formats = [
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WEBP', ext: 'webp' },
  { value: 'image/gif', label: 'GIF', ext: 'gif' },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp' }
]

function ImageConverter() {
  const [files, setFiles] = useState([])
  const [targetFormat, setTargetFormat] = useState('image/jpeg')
  const [converting, setConverting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'))
    setFiles(prev => [...prev, ...validFiles])
    setCompleted(false)
    setResults([])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setCompleted(false)
    setResults([])
  }

  const convertImage = async (file, targetFormat) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const ext = formats.find(f => f.value === targetFormat)?.ext || 'jpg'
            const originalName = file.name.replace(/\.[^/.]+$/, '')
            resolve({
              originalName: file.name,
              convertedName: `${originalName}.${ext}`,
              originalSize: file.size,
              convertedSize: blob.size,
              url: URL.createObjectURL(blob),
              blob
            })
          } else {
            reject(new Error('Error al convertir'))
          }
        }, targetFormat, 0.92)
      }

      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    
    setConverting(true)
    setResults([])
    
    try {
      const convertedResults = await Promise.all(
        files.map(file => convertImage(file, targetFormat))
      )
      setResults(convertedResults)
      setCompleted(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setConverting(false)
    }
  }

  const downloadFile = (result) => {
    const link = document.createElement('a')
    link.href = result.url
    link.download = result.convertedName
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

  return (
    <div className="converter-page">
      <div className="converter-container">
        <div className="converter-header">
          <h1>Convertir Imágenes</h1>
          <p>Convierte tus imágenes a cualquier formato de forma rápida y segura</p>
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3>Arrastra tus imágenes aquí</h3>
              <p>o haz clic para seleccionar</p>
              <span className="formats-hint">JPG, PNG, WEBP, GIF, BMP</span>
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
                <label>Convertir a:</label>
                <div className="format-buttons">
                  {formats.map(format => (
                    <button
                      key={format.value}
                      className={`format-btn ${targetFormat === format.value ? 'active' : ''}`}
                      onClick={() => setTargetFormat(format.value)}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="convert-btn"
                onClick={handleConvert}
                disabled={converting}
              >
                {converting ? (
                  <>
                    <span className="spinner"></span>
                    Convirtiendo...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 3 21 3 21 8"/>
                      <line x1="4" y1="20" x2="21" y2="3"/>
                      <polyline points="21 16 21 21 16 21"/>
                      <line x1="15" y1="15" x2="21" y2="21"/>
                      <line x1="4" y1="4" x2="9" y2="9"/>
                    </svg>
                    Convertir {files.length > 1 ? `${files.length} archivos` : 'imagen'}
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
                  Conversión completada
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
                      <img src={result.url} alt={result.convertedName} />
                    </div>
                    <div className="result-info">
                      <span className="result-name">{result.convertedName}</span>
                      <div className="result-sizes">
                        <span className="original">{formatSize(result.originalSize)}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                        <span className="converted">{formatSize(result.convertedSize)}</span>
                      </div>
                      <span className={`size-change ${result.convertedSize < result.originalSize ? 'reduced' : 'increased'}`}>
                        {result.convertedSize < result.originalSize 
                          ? `-${((1 - result.convertedSize / result.originalSize) * 100).toFixed(1)}%`
                          : `+${((result.convertedSize / result.originalSize - 1) * 100).toFixed(1)}%`
                        }
                      </span>
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

export default ImageConverter
