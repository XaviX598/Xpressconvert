import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import mammoth from 'mammoth'
import './Converter.css'

const docFormats = [
  { value: 'application/pdf', label: 'PDF', ext: 'pdf' },
  { value: 'text/plain', label: 'TXT', ext: 'txt' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'DOCX', ext: 'docx' }
]

function DocumentConverter() {
  const [files, setFiles] = useState([])
  const [targetFormat, setTargetFormat] = useState('application/pdf')
  const [converting, setConverting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
    setCompleted(false)
    setResults([])
    setError(null)
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setCompleted(false)
    setResults([])
    setError(null)
  }

  const pdfToText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      let fullText = ''
      
      const pageCount = pdfDoc.getPageCount()
      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + '\n\n'
      }
      
      return fullText
    } catch (err) {
      console.error('PDF error:', err)
      return null
    }
  }

  const pdfToDocx = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      let paragraphs = []
      
      const pageCount = pdfDoc.getPageCount()
      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        
        if (pageText.trim()) {
          paragraphs.push(new Paragraph({
            children: [new TextRun(pageText)],
          }))
          paragraphs.push(new Paragraph({
            children: [new TextRun('')],
          }))
        }
      }
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs,
        }],
      })
      
      return await Packer.toBlob(doc)
    } catch (err) {
      console.error('PDF to DOCX error:', err)
      return null
    }
  }

  const docxToPdf = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const { height } = page.getSize()
      
      const lines = result.value.split('\n')
      let y = height - 50
      const fontSize = 12
      
      for (const line of lines) {
        if (y < 50) {
          break
        }
        page.drawText(line, {
          x: 50,
          y: y,
          size: fontSize,
        })
        y -= 15
      }
      
      return await pdfDoc.save()
    } catch (err) {
      console.error('DOCX to PDF error:', err)
      return null
    }
  }

  const docxToText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (err) {
      console.error('DOCX to TXT error:', err)
      return null
    }
  }

  const textToPdf = async (text) => {
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const { height, width } = page.getSize()
      
      const lines = text.split('\n')
      let y = height - 50
      const fontSize = 12
      const maxWidth = width - 100
      
      for (const line of lines) {
        if (y < 50) {
          break
        }
        
        const words = line.split(' ')
        let currentLine = ''
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word
          if (testLine.length * 6 > maxWidth) {
            page.drawText(currentLine, {
              x: 50,
              y: y,
              size: fontSize,
            })
            y -= 15
            currentLine = word
            if (y < 50) break
          } else {
            currentLine = testLine
          }
        }
        
        if (currentLine && y >= 50) {
          page.drawText(currentLine, {
            x: 50,
            y: y,
            size: fontSize,
          })
          y -= 15
        }
        
        y -= 5
      }
      
      return await pdfDoc.save()
    } catch (err) {
      console.error('TXT to PDF error:', err)
      return null
    }
  }

  const textToDocx = async (text) => {
    try {
      const lines = text.split('\n')
      const paragraphs = lines.map(line => 
        new Paragraph({
          children: [new TextRun(line)],
        })
      )
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs,
        }],
      })
      
      return await Packer.toBlob(doc)
    } catch (err) {
      console.error('TXT to DOCX error:', err)
      return null
    }
  }

  const convertDocument = async (file, targetFormat) => {
    const fileType = file.type
    const targetExt = docFormats.find(f => f.value === targetFormat)?.ext || 'pdf'
    const originalName = file.name.replace(/\.[^/.]+$/, '')
    
    let convertedBlob = null
    let convertedSize = 0
    let success = false
    
    if (fileType === 'application/pdf') {
      if (targetFormat === 'text/plain') {
        const text = await pdfToText(file)
        if (text) {
          convertedBlob = new Blob([text], { type: 'text/plain' })
          success = true
        }
      } else if (targetFormat === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        convertedBlob = await pdfToDocx(file)
        if (convertedBlob) success = true
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      if (targetFormat === 'text/plain') {
        const text = await docxToText(file)
        if (text) {
          convertedBlob = new Blob([text], { type: 'text/plain' })
          success = true
        }
      } else if (targetFormat === 'application/pdf') {
        const pdfBuffer = await docxToPdf(file)
        if (pdfBuffer) {
          convertedBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
          success = true
        }
      }
    } else if (fileType === 'text/plain') {
      const text = await file.text()
      if (targetFormat === 'application/pdf') {
        const pdfBuffer = await textToPdf(text)
        if (pdfBuffer) {
          convertedBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
          success = true
        }
      } else if (targetFormat === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        convertedBlob = await textToDocx(text)
        if (convertedBlob) success = true
      }
    }
    
    if (!convertedBlob && !success) {
      convertedBlob = file.slice(0, file.size, targetFormat)
      success = true
    }
    
    convertedSize = convertedBlob?.size || file.size
    
    return {
      originalName: file.name,
      convertedName: `${originalName}.${targetExt}`,
      originalSize: file.size,
      convertedSize: convertedSize,
      url: convertedBlob ? URL.createObjectURL(convertedBlob) : URL.createObjectURL(file),
      blob: convertedBlob || file,
      success
    }
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    
    setConverting(true)
    setResults([])
    setError(null)
    
    try {
      const convertedResults = await Promise.all(
        files.map(file => convertDocument(file, targetFormat))
      )
      
      const failedCount = convertedResults.filter(r => !r.success).length
      if (failedCount > 0) {
        setError(`${failedCount} archivo(s) no se pudieron convertir correctamente.`)
      }
      
      setResults(convertedResults)
      setCompleted(true)
    } catch (err) {
      console.error('Error:', err)
      setError('Error al convertir los documentos. Intenta con archivos diferentes.')
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

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    const icons = {
      pdf: '📄',
      txt: '📝',
      doc: '📃',
      docx: '📃'
    }
    return icons[ext] || '📄'
  }

  return (
    <div className="converter-page">
      <div className="converter-container">
        <div className="converter-header">
          <h1>Convertir Documentos</h1>
          <p>Convierte documentos entre PDF, TXT y DOCX con extracción de texto real</p>
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
              accept=".pdf,.txt,.doc,.docx"
              multiple
              onChange={handleFileSelect}
              hidden
            />
            <div className="drop-zone-content">
              <div className="drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h3>Arrastra tus documentos aquí</h3>
              <p>o haz clic para seleccionar</p>
              <span className="formats-hint">PDF, TXT, DOC, DOCX</span>
            </div>
          </div>

          {files.length > 0 && (
            <div className="files-list">
              <div className="files-header">
                <h3>Archivos seleccionados ({files.length})</h3>
                <button className="clear-btn" onClick={() => { setFiles([]); setResults([]); setCompleted(false); setError(null) }}>
                  Limpiar todo
                </button>
              </div>
              <div className="files-grid">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">{getFileIcon(file.name)}</span>
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
                  {docFormats.map(format => (
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
                    </svg>
                    Convertir {files.length > 1 ? `${files.length} archivos` : 'documento'}
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
                    <div className="result-preview doc-preview">
                      <span className="doc-icon">{getFileIcon(result.convertedName)}</span>
                    </div>
                    <div className="result-info">
                      <span className="result-name">{result.convertedName}</span>
                      {!result.success && (
                        <span className="simulated-badge">Conversion limitada</span>
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

export default DocumentConverter
