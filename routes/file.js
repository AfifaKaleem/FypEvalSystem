const express = require('express');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

const router = express.Router();

const proposalsPath = path.join(process.cwd(), 'uploads', 'proposals');
const recentFilesJsonPath = path.join(proposalsPath, 'recentFiles.json');

// Helper to read recentFiles.json
const getRecentFiles = () => {
  if (!fs.existsSync(recentFilesJsonPath)) {
    return [];
  }
  const content = fs.readFileSync(recentFilesJsonPath);
  return JSON.parse(content || '[]');
};

// Helper to save recentFiles.json
const saveRecentFile = (filename) => {
  const currentList = getRecentFiles();
  if (!currentList.includes(filename)) {
    currentList.push(filename);
    fs.writeFileSync(recentFilesJsonPath, JSON.stringify(currentList, null, 2));
  }
};

// 📥 Upload file and save to list
router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  saveRecentFile(file.originalname);
  res.status(200).json({ message: 'File uploaded successfully', file: file.originalname });
});

// 📃 Return uploaded files list
router.get('/list-recent-files', (req, res) => {
  const recentFiles = getRecentFiles();

  const filesData = recentFiles
    .map(file => {
      const fullPath = path.join(proposalsPath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          fileName: file,
          mtime: stats.mtime,
          downloadLink: `http://localhost:8080/file/download-file/${file}`,
          viewLink: `http://localhost:8080/file/view-file/${file}`
        };
      }
      return null;
    })
    .filter(f => f !== null);

  if (filesData.length === 0) {
    return res.status(404).json({ message: 'No uploaded files found' });
  }

  res.status(200).json({ recentFiles: filesData });
});

// 🗑️ Delete file and update list
router.delete('/delete-file/:filename', (req, res) => {
  const filePath = path.join(proposalsPath, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlinkSync(filePath);

  const updatedList = getRecentFiles().filter(f => f !== req.params.filename);
  fs.writeFileSync(recentFilesJsonPath, JSON.stringify(updatedList, null, 2));

  res.status(200).json({ message: 'File deleted successfully' });
});

module.exports = router;
