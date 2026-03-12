import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ImageConverter from './pages/ImageConverter'
import ImageCompressor from './pages/ImageCompressor'
import ImageResizer from './pages/ImageResizer'
import DocumentConverter from './pages/DocumentConverter'
import AudioConverter from './pages/AudioConverter'
import VideoConverter from './pages/VideoConverter'
import ImageEditor from './pages/ImageEditor'
import MergePDFs from './pages/MergePDFs'
import ExtractAudio from './pages/ExtractAudio'
import ImageToPDF from './pages/ImageToPDF'
import './styles/index.css'

function App() {
  return (
    <>
      <div className="progress-container">
        <div className="progress-bar"></div>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convertir-imagenes" element={<ImageConverter />} />
          <Route path="/comprimir" element={<ImageCompressor />} />
          <Route path="/redimensionar" element={<ImageResizer />} />
          <Route path="/documentos" element={<DocumentConverter />} />
          <Route path="/audio" element={<AudioConverter />} />
          <Route path="/video" element={<VideoConverter />} />
          <Route path="/editor" element={<ImageEditor />} />
          <Route path="/unir-pdfs" element={<MergePDFs />} />
          <Route path="/extraer-audio" element={<ExtractAudio />} />
          <Route path="/imagenes-a-pdf" element={<ImageToPDF />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
