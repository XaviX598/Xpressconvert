import { useState, useRef } from 'react'
import './Converter.css'

const videoFormats = [
  { value: 'video/mp4', label: 'MP4', ext: 'mp4' },
  { value: 'video/webm', label: 'WEBM', ext: 'webm' },
  { value: 'video/quicktime', label: 'MOV', ext: 'mov' },
  { value: 'video/x-msvideo', label: 'AVI', ext: 'avi' }
]

const qualityPresets = [
  { label: '720p HD', width: 1280, height: 720, bitrate: '2M' },
  { label: '480p SD', width: 854, height: 480, bitrate: '1M' },
  { label: '360p', width: 640, height: 360, bitrate: '500K' }
]

function VideoConverter() {
  const [files, setFiles] = useState([])
  const [targetFormat, setTargetFormat] = useState('video/mp4')
  const [selectedQuality, setSelectedQuality] = useState(0)
  const [converting, setConverting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState({})
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => file.type.startsWith('video/'))
    setFiles(prev => [...prev, ...validFiles])
    setCompleted(false)
    setResults([])
    setProgress({})
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setCompleted(false)
    setResults([])
    setProgress({})
  }

  const convertVideo = async (file, targetFormat, qualityIndex) => {
    return new Promise((resolve) => {
      const progressKey = file.name
      const quality = qualityPresets[qualityIndex]
      const targetExt = videoFormats.find(f => f.value === targetFormat)?.ext || 'mp4'
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      
      let currentProgress = 0
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15
        if (currentProgress > 90) currentProgress = 90
        setProgress(prev => ({ ...prev, [progressKey]: currentProgress }))
      }, 200)
      
      setTimeout(() => {
        clearInterval(progressInterval)
        setProgress(prev => ({ ...prev, [progressKey]: 100 }))
        
        const estimatedSize = Math.floor(file.size * 0.7)
        
        resolve({
          originalName: file.name,
          convertedName: `${originalName}_${quality.width}x${quality.height}.${targetExt}`,
          originalSize: file.size,
          convertedSize: estimatedSize,
          url: URL.createObjectURL(file),
          blob: file,
          quality: quality.label,
          dimensions: `${quality.width}x${quality.height}`,
          simulated: true
        })
      }, 2000 + Math.random() * 2000)
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    
    setConverting(true)
    setResults([])
    
    try {
      const convertedResults = await Promise.all(
        files.map(file => convertVideo(file, targetFormat, selectedQuality))
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
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  return (
    <div className="converter-page">
      <div className="converter-container">
        <div className="converter-header">
          <h1>Convertir Video</h1>
          <p>Convierte tus videos a diferentes formatos y calidades</p>
        </div>

        <div className="converter-content">
          <div 
            className={`drop-zone ${files.length > 0 ? 'has-files' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelect}
              hidden
            />
            <div className="drop-zone-content">
              <div className="drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
              </div>
              <h3>Arrastra tus videos aquí</h3>
              <p>o haz clic para seleccionar</p>
              <span className="formats-hint">MP4, WEBM, MOV, AVI, MKV</span>
            </div>
          </div>

          {files.length > 0 && (
            <div className="files-list">
              <div className="files-header">
                <h3>Archivos seleccionados ({files.length})</h3>
                <button className="clear-btn" onClick={() => { setFiles([]); setResults([]); setCompleted(false); setProgress({}) }}>
                  Limpiar todo
                </button>
              </div>
              <div className="files-grid">
                {files.map((file, index) => (
                  <div key={index} className="file-item video-item">
                    <div className="video-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    </div>
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatSize(file.size)}</span>
                    </div>
                    {converting && progress[file.name] !== undefined && progress[file.name] < 100 && (
                      <div className="file-progress">
                        <div className="progress-bar-mini" style={{ width: `${progress[file.name]}%` }}></div>
                      </div>
                    )}
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
                  {videoFormats.map(format => (
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

              <div className="format-selector">
                <label>Calidad:</label>
                <div className="quality-buttons">
                  {qualityPresets.map((quality, index) => (
                    <button
                      key={index}
                      className={`quality-btn ${selectedQuality === index ? 'active' : ''}`}
                      onClick={() => setSelectedQuality(index)}
                    >
                      <span className="quality-label">{quality.label}</span>
                      <span className="quality-info">{quality.width}x{quality.height}</span>
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
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                      <line x1="7" y1="2" x2="7" y2="22"/>
                      <line x1="17" y1="2" x2="17" y2="22"/>
                    </svg>
                    Convertir {files.length > 1 ? `${files.length} videos` : 'video'}
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
                    <div className="result-preview video-preview">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    </div>
                    <div className="result-info">
                      <span className="result-name">{result.convertedName}</span>
                      <span className="video-quality">{result.quality} • {result.dimensions}</span>
                      {result.simulated && (
                        <span className="simulated-badge">Simulado</span>
                      )}
                      <div className="result-sizes">
                        <span className="original">{formatSize(result.originalSize)}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                        <span className="converted">{formatSize(result.convertedSize)}</span>
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

export default VideoConverter
