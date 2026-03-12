# XpressConvert

Herramienta web para convertir, comprimir y optimizar archivos.

## Características

- **Convertir Imágenes**: JPEG, PNG, WEBP, GIF, BMP
- **Comprimir Imágenes**: Reduce el tamaño sin perder calidad
- **Redimensionar Imágenes**: Con preajustes (Instagram, Facebook, YouTube, etc.)
- **Editor de Imágenes**: Filtros, rotación, brillo, contraste, saturación
- **Imágenes a PDF**: Convierte varias imágenes en un documento PDF
- **Unir PDFs**: Combina múltiples PDFs en uno
- **Documentos**: PDF ↔ TXT ↔ DOCX
- **Audio**: Convierte entre MP3, WAV, OGG
- **Video**: Convierte entre MP4, WEBM, MOV, AVI
- **Extraer Audio**: Separa el audio de un video

## Tech Stack

- React + Vite
- pdf-lib (manejo de PDFs)
- docx (creación de documentos Word)
- mammoth (extracción de texto)
- Web Audio API

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build
```

## Despliegue en Vercel

1. Sube este proyecto a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Importa el repositorio
4. Vercel detectará automáticamente la configuración

O desde CLI:

```bash
npm i -g vercel
vercel
```

## Licencia

MIT
