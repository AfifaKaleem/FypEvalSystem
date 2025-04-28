const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const upload = require('../middleware/upload'); 

const router = express.Router();

// Correct folder path
const proposalsPath = path.join(process.cwd(), 'uploads', 'proposals');

// 📂 List all uploaded PDF files
router.get('/list-files', (req, res) => {
  fs.readdir(proposalsPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return res.status(500).json({ error: 'Unable to list files' });
    }
    const fileLinks = files.map(file => ({
      fileName: file,
      downloadLink: `http://localhost:8080/file/download-file/${file}`,
      viewLink: `http://localhost:8080/file/view-file/${file}`
    }));
    res.status(200).json({ files: fileLinks });
  });
});

// 📥 Upload a new PDF
router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully', file: file.filename });
});

// 📄 Download a PDF file
router.get('/download-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(proposalsPath, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// 👀 View a PDF file in Browser
router.get('/view-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(proposalsPath, filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// 🧠 Parse PDF (Extract text)
router.get('/parse-file/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(proposalsPath, filename);

  if (fs.existsSync(filePath)) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      res.status(200).json({ text: data.text });
    } catch (error) {
      res.status(500).json({ error: 'Error parsing PDF' });
    }
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// 🗑️ Delete a PDF file
router.delete('/delete-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(proposalsPath, filename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ error: 'Unable to delete file' });
      }
      res.status(200).json({ message: 'File deleted successfully' });
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;
