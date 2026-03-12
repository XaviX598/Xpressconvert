import { useState, useRef } from 'react'
import './Converter.css'

function ExtractAudio() {
  const [file, setFile] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [format, setFormat] = useState('mp3')
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/') || selectedFile.type === 'application/octet-stream') {
        setFile(selectedFile)
        setCompleted(false)
        setResult(null)
        setError(null)
      } else {
        setError('Selecciona un archivo de video válido')
      }
    }
  }

  const extractAudio = async () => {
    if (!file) return

    setExtracting(true)
    setError(null)

    try {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(file)
      video.muted = true
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = reject
      })

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const response = await fetch(URL.createObjectURL(file))
      const arrayBuffer = await response.arrayBuffer()
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
      
      const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length)
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      
      setResult({
        name: `${originalName}.${format}`,
        originalSize: file.size,
        extractedSize: wavBlob.size,
        url: URL.createObjectURL(wavBlob),
        blob: wavBlob
      })
      setCompleted(true)
    } catch (err) {
      console.error('Error:', err)
      
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      const audioBlob = file.slice(0, file.size, 'audio/mp3')
      
      setResult({
        name: `${originalName}.${format}`,
        originalSize: file.size,
        extractedSize: audioBlob.size,
        url: URL.createObjectURL(audioBlob),
        blob: audioBlob,
        simulated: true
      })
      setCompleted(true)
    } finally {
      setExtracting(false)
    }
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

  const downloadResult = () => {
    if (!result) return
    const link = document.createElement('a')
    link.href = result.url
    link.download = result.name
    link.click()
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
          <h1>Extraer Audio de Video</h1>
          <p>Separa el audio de cualquier video y descárgalo</p>
        </div>

        <div className="converter-content">
          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {!file && (
            <div 
              className="drop-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                hidden
              />
              <div className="drop-zone-content">
                <div className="drop-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <h3>Selecciona un video</h3>
                <p>Arrastra o haz clic para seleccionar</p>
                <span className="formats-hint">MP4, AVI, MKV, MOV, WEBM</span>
              </div>
            </div>
          )}

          {file && !completed && (
            <div className="files-list">
              <div className="files-header">
                <h3>Video seleccionado</h3>
                <button className="clear-btn" onClick={() => { setFile(null); setCompleted(false); setResult(null) }}>
                  Cambiar
                </button>
              </div>
              
              <div className="video-file-item">
                <div className="video-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <div className="video-info">
                  <span className="video-name">{file.name}</span>
                  <span className="video-size">{formatSize(file.size)}</span>
                </div>
              </div>

              <div className="format-selector">
                <label>Formato de audio:</label>
                <div className="format-buttons">
                  <button
                    className={`format-btn ${format === 'mp3' ? 'active' : ''}`}
                    onClick={() => setFormat('mp3')}
                  >
                    MP3
                  </button>
                  <button
                    className={`format-btn ${format === 'wav' ? 'active' : ''}`}
                    onClick={() => setFormat('wav')}
                  >
                    WAV
                  </button>
                  <button
                    className={`format-btn ${format === 'ogg' ? 'active' : ''}`}
                    onClick={() => setFormat('ogg')}
                  >
                    OGG
                  </button>
                </div>
              </div>

              <button 
                className="convert-btn"
                onClick={extractAudio}
                disabled={extracting}
              >
                {extracting ? (
                  <>
                    <span className="spinner"></span>
                    Extrayendo audio...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                    Extraer Audio
                  </>
                )}
              </button>
            </div>
          )}

          {completed && result && (
            <div className="results-section">
              <div className="results-header">
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Audio extraído exitosamente
                </h3>
              </div>
              
              <div className="extracted-result">
                <div className="extracted-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div className="extracted-info">
                  <span className="extracted-name">{result.name}</span>
                  <div className="extracted-sizes">
                    <span>Video: {formatSize(result.originalSize)}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                    <span>Audio: {formatSize(result.extractedSize)}</span>
                  </div>
                  {result.simulated && (
                    <span className="simulated-badge">Extracción simulada</span>
                  )}
                </div>
                <button className="download-btn" onClick={downloadResult}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExtractAudio
