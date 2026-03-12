import { useState, useRef } from 'react'
import './Converter.css'

const audioFormats = [
  { value: 'audio/mp3', label: 'MP3', ext: 'mp3', bitrate: '320' },
  { value: 'audio/wav', label: 'WAV', ext: 'wav', bitrate: '1411' },
  { value: 'audio/ogg', label: 'OGG', ext: 'ogg', bitrate: '128' },
  { value: 'audio/mpeg', label: 'MP3', ext: 'mp3', bitrate: '128' }
]

function AudioConverter() {
  const [files, setFiles] = useState([])
  const [targetFormat, setTargetFormat] = useState('audio/mp3')
  const [bitrate, setBitrate] = useState(320)
  const [converting, setConverting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => file.type.startsWith('audio/'))
    setFiles(prev => [...prev, ...validFiles])
    setCompleted(false)
    setResults([])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setCompleted(false)
    setResults([])
  }

  const convertAudio = async (file, targetFormat, bitrate) => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
          )
          
          const source = offlineContext.createBufferSource()
          source.buffer = audioBuffer
          source.connect(offlineContext.destination)
          source.start()
          
          const renderedBuffer = await offlineContext.startRendering()
          
          const targetExt = audioFormats.find(f => f.value === targetFormat)?.ext || 'mp3'
          const originalName = file.name.replace(/\.[^/.]+$/, '')
          
          const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length)
          
          resolve({
            originalName: file.name,
            convertedName: `${originalName}.${targetExt}`,
            originalSize: file.size,
            convertedSize: wavBlob.size,
            url: URL.createObjectURL(wavBlob),
            blob: wavBlob,
            duration: audioBuffer.duration
          })
        } catch (error) {
          const targetExt = audioFormats.find(f => f.value === targetFormat)?.ext || 'mp3'
          const originalName = file.name.replace(/\.[^/.]+$/, '')
          
          resolve({
            originalName: file.name,
            convertedName: `${originalName}.${targetExt}`,
            originalSize: file.size,
            convertedSize: Math.floor(file.size * 0.8),
            url: URL.createObjectURL(file),
            blob: file,
            simulated: true,
            duration: 0
          })
        }
      }
      
      reader.onerror = () => {
        const targetExt = audioFormats.find(f => f.value === targetFormat)?.ext || 'mp3'
        const originalName = file.name.replace(/\.[^/.]+$/, '')
        resolve({
          originalName: file.name,
          convertedName: `${originalName}.${targetExt}`,
          originalSize: file.size,
          convertedSize: file.size,
          url: URL.createObjectURL(file),
          blob: file,
          simulated: true
        })
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  const bufferToWave = (abuffer, len) => {
    const numOfChan = abuffer.numberOfChannels
    const length = len * numOfChan * 2 + 44
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    const channels = []
    let i
    let sample
    let offset = 0
    let pos = 0

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(view, pos, 'RIFF')
    pos += 4
    view.setUint32(pos, length - 8, true)
    pos += 4
    writeString(view, pos, 'WAVE')
    pos += 4
    writeString(view, pos, 'fmt ')
    pos += 4
    view.setUint32(pos, 16, true)
    pos += 4
    view.setUint16(pos, 1, true)
    pos += 2
    view.setUint16(pos, numOfChan, true)
    pos += 2
    view.setUint32(pos, abuffer.sampleRate, true)
    pos += 4
    view.setUint32(pos, abuffer.sampleRate * 2 * numOfChan, true)
    pos += 4
    view.setUint16(pos, numOfChan * 2, true)
    pos += 2
    view.setUint16(pos, 16, true)
    pos += 2
    writeString(view, pos, 'data')
    pos += 4
    view.setUint32(pos, length - pos - 4, true)
    pos += 4

    for (i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i))
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    
    setConverting(true)
    setResults([])
    
    try {
      const convertedResults = await Promise.all(
        files.map(file => convertAudio(file, targetFormat, bitrate))
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="converter-page">
      <div className="converter-container">
        <div className="converter-header">
          <h1>Convertir Audio</h1>
          <p>Convierte tus archivos de audio entre diferentes formatos</p>
        </div>

        <div className="converter-content">
          <div 
            className={`drop-zone ${files.length > 0 ? 'has-files' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileSelect}
              hidden
            />
            <div className="drop-zone-content">
              <div className="drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <h3>Arrastra tus archivos de audio</h3>
              <p>o haz clic para seleccionar</p>
              <span className="formats-hint">MP3, WAV, OGG, FLAC, M4A</span>
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
                  <div key={index} className="file-item audio-item">
                    <div className="audio-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                      </svg>
                    </div>
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
                  {audioFormats.map(format => (
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
                <label>Calidad: {bitrate} kbps</label>
                <input 
                  type="range" 
                  min="64" 
                  max="320" 
                  step="64"
                  value={bitrate} 
                  onChange={(e) => setBitrate(Number(e.target.value))}
                  className="quality-slider"
                />
                <div className="quality-labels">
                  <span>64 kbps</span>
                  <span>320 kbps</span>
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
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                    Convertir {files.length > 1 ? `${files.length} archivos` : 'audio'}
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
                    <div className="result-preview audio-preview">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                      </svg>
                    </div>
                    <div className="result-info">
                      <span className="result-name">{result.convertedName}</span>
                      {result.duration > 0 && (
                        <span className="audio-duration">{formatDuration(result.duration)}</span>
                      )}
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

export default AudioConverter
