import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import './Converter.css'

function ImageToPDF() {
  const [files, setFiles] = useState([])
  const [converting, setConverting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'))
    setFiles(prev => [...prev, ...validFiles])
    setCompleted(false)
    setResult(null)
    setError(null)
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setCompleted(false)
    setResult(null)
  }

  const moveFile = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newFiles = [...files]
      ;[newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]]
      setFiles(newFiles)
    } else if (direction === 'down' && index < files.length - 1) {
      const newFiles = [...files]
      ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
      setFiles(newFiles)
    }
  }

  const convertToPDF = async () => {
    if (files.length === 0) {
      setError('Selecciona al menos una imagen')
      return
    }

    setConverting(true)
    setError(null)

    try {
      const pdfDoc = await PDFDocument.create()

      for (const file of files) {
        const imageBytes = await file.arrayBuffer()
        let image

        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes)
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        } else {
          const img = new Image()
          const blob = await fetch(URL.createObjectURL(file)).then(r => r.blob())
          const bitmap = await createImageBitmap(blob)
          
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(bitmap, 0, 0)
          
          const jpgData = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.92)
          })
          
          image = await pdfDoc.embedJpg(await jpgData.arrayBuffer())
        }

        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      const totalSize = files.reduce((acc, f) => acc + f.size, 0)
      
      setResult({
        name: 'images-document.pdf',
        originalSize: totalSize,
        pdfSize: blob.size,
        pageCount: files.length,
        url: URL.createObjectURL(blob),
        blob
      })
      setCompleted(true)
    } catch (err) {
      console.error('Error:', err)
      setError('Error al convertir las imágenes. Verifica que sean formatos válidos.')
    } finally {
      setConverting(false)
    }
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
          <h1>Imágenes a PDF</h1>
          <p>Convierte tus imágenes a un documento PDF</p>
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
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h3>Arrastra tus imágenes aquí</h3>
              <p>o haz clic para seleccionar</p>
              <span className="formats-hint">JPG, PNG, WEBP, GIF</span>
            </div>
          </div>

          {files.length > 0 && (
            <div className="files-list">
              <div className="files-header">
                <h3>Imágenes ({files.length})</h3>
                <button className="clear-btn" onClick={() => { setFiles([]); setCompleted(false); setResult(null) }}>
                  Limpiar todo
                </button>
              </div>
              <div className="files-grid image-grid">
                {files.map((file, index) => (
                  <div key={index} className="image-item">
                    <div className="image-controls">
                      <button 
                        onClick={() => moveFile(index, 'up')}
                        disabled={index === 0}
                        className="move-btn"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="18 15 12 9 6 15"/>
                        </svg>
                      </button>
                      <span className="order-number">{index + 1}</span>
                      <button 
                        onClick={() => moveFile(index, 'down')}
                        disabled={index === files.length - 1}
                        className="move-btn"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    </div>
                    <img src={URL.createObjectURL(file)} alt={file.name} />
                    <div className="image-info">
                      <span className="image-name">{file.name}</span>
                      <span className="image-size">{formatSize(file.size)}</span>
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

              <button 
                className="convert-btn"
                onClick={convertToPDF}
                disabled={converting}
              >
                {converting ? (
                  <>
                    <span className="spinner"></span>
                    Convirtiendo a PDF...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Crear PDF ({files.length} {files.length === 1 ? 'imagen' : 'imágenes'})
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
                  PDF creado exitosamente
                </h3>
              </div>
              
              <div className="merged-result">
                <div className="merged-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="merged-info">
                  <span className="merged-name">{result.name}</span>
                  <span className="merged-meta">{result.pageCount} páginas • {formatSize(result.pdfSize)}</span>
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

export default ImageToPDF
