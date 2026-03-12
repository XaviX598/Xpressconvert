import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import './Converter.css'

function MergePDFs() {
  const [files, setFiles] = useState([])
  const [merging, setMerging] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf')
    setFiles(prev => [...prev, ...pdfFiles])
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

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Selecciona al menos 2 PDFs para unir')
      return
    }

    setMerging(true)
    setError(null)

    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const pdfBytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(pdfBytes)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      
      setResult({
        name: 'merged-document.pdf',
        size: blob.size,
        url: URL.createObjectURL(blob),
        blob
      })
      setCompleted(true)
    } catch (err) {
      console.error('Error:', err)
      setError('Error al unir los PDFs. Verifica que sean archivos válidos.')
    } finally {
      setMerging(false)
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
          <h1>Unir PDFs</h1>
          <p>Combina varios PDFs en un solo documento</p>
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
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              hidden
            />
            <div className="drop-zone-content">
              <div className="drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <h3>Arrastra tus PDFs aquí</h3>
              <p>o haz clic para seleccionar</p>
              <span className="formats-hint">Selecciona varios PDFs</span>
            </div>
          </div>

          {files.length > 0 && (
            <div className="files-list">
              <div className="files-header">
                <h3>PDFs para unir ({files.length})</h3>
                <button className="clear-btn" onClick={() => { setFiles([]); setCompleted(false); setResult(null) }}>
                  Limpiar todo
                </button>
              </div>
              <div className="pdf-list">
                {files.map((file, index) => (
                  <div key={index} className="pdf-item">
                    <div className="pdf-order">
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
                    <div className="pdf-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div className="pdf-info">
                      <span className="pdf-name">{file.name}</span>
                      <span className="pdf-size">{formatSize(file.size)}</span>
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

              {files.length >= 2 && !completed && (
                <button 
                  className="convert-btn merge-btn"
                  onClick={handleMerge}
                  disabled={merging}
                >
                  {merging ? (
                    <>
                      <span className="spinner"></span>
                      Uniendo PDFs...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                      Unir {files.length} PDFs
                    </>
                  )}
                </button>
              )}
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
                  PDFs combinados exitosamente
                </h3>
              </div>
              
              <div className="merged-result">
                <div className="merged-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <polyline points="9 15 12 18 15 15"/>
                    <line x1="12" y1="12" x2="12" y2="18"/>
                  </svg>
                </div>
                <div className="merged-info">
                  <span className="merged-name">{result.name}</span>
                  <span className="merged-size">{formatSize(result.size)}</span>
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

export default MergePDFs
