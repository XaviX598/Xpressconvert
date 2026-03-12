import { useState, useRef } from 'react'
import './Converter.css'

function ImageCompressor() {
  const [files, setFiles] = useState([])
  const [quality, setQuality] = useState(70)
  const [compressing, setCompressing] = useState(false)
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

  const compressImage = async (file, quality) => {
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
            resolve({
              originalName: file.name,
              compressedName: `compressed_${file.name}`,
              originalSize: file.size,
              compressedSize: blob.size,
              url: URL.createObjectURL(blob),
              blob
            })
          } else {
            reject(new Error('Error al comprimir'))
          }
        }, 'image/jpeg', quality / 100)
      }

      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleCompress = async () => {
    if (files.length === 0) return
    
    setCompressing(true)
    setResults([])
    
    try {
      const compressedResults = await Promise.all(
        files.map(file => compressImage(file, quality))
      )
      setResults(compressedResults)
      setCompleted(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setCompressing(false)
    }
  }

  const downloadFile = (result) => {
    const link = document.createElement('a')
    link.href = result.url
    link.download = result.compressedName
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
          <h1>Comprimir Imágenes</h1>
          <p>Reduce el tamaño de tus imágenes manteniendo la mejor calidad posible</p>
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
                  <polyline points="4 14 10 14 10 20"/>
                  <polyline points="20 10 14 10 14 4"/>
                  <line x1="14" y1="10" x2="21" y2="3"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              </div>
              <h3>Arrastra tus imágenes aquí</h3>
              <p>o haz clic para seleccionar</p>
              <span className="formats-hint">JPG, PNG, WEBP</span>
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
                <label>Calidad de compresión: {quality}%</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="quality-slider"
                />
                <div className="quality-labels">
                  <span>Menor tamaño</span>
                  <span>Mejor calidad</span>
                </div>
              </div>

              <button 
                className="convert-btn"
                onClick={handleCompress}
                disabled={compressing}
              >
                {compressing ? (
                  <>
                    <span className="spinner"></span>
                    Comprimiendo...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 14 10 14 10 20"/>
                      <polyline points="20 10 14 10 14 4"/>
                    </svg>
                    Comprimir {files.length > 1 ? `${files.length} archivos` : 'imagen'}
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
                  Compresión completada
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
                      <img src={result.url} alt={result.compressedName} />
                    </div>
                    <div className="result-info">
                      <span className="result-name">{result.compressedName}</span>
                      <div className="result-sizes">
                        <span className="original">{formatSize(result.originalSize)}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                        <span className="converted">{formatSize(result.compressedSize)}</span>
                      </div>
                      <span className={`size-change ${result.compressedSize < result.originalSize ? 'reduced' : 'increased'}`}>
                        {result.compressedSize < result.originalSize 
                          ? `-${((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}%`
                          : `+${((result.compressedSize / result.originalSize - 1) * 100).toFixed(1)}%`
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

export default ImageCompressor
