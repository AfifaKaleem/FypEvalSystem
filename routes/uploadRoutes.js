const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const upload = require('../middleware/upload'); 

const router = express.Router();

// Correct folder path
const proposalsPath = path.join(process.cwd(), 'uploads', 'proposals');
const prop = path.join(process.cwd(), 'TemplatesDocs', 'Docs');

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


// / 📂 List all uploaded PDF files
router.get('/list-files-templates', (req, res) => {
  fs.readdir(prop, (err, files) => {
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



// 📃 Return uploaded files list
// 📃 Return list of files uploaded by user
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


router.get('/list-recent-files', (req, res) => {
  const timeWindowInHours = '12s'; // ⏱ Change this to 1 for last hour, etc.
  const now = Date.now();

  fs.readdir(proposalsPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return res.status(500).json({ error: 'Unable to list files' });
    }

    const recentFiles = files
      .map(file => {
        const fullPath = path.join(proposalsPath, file);
        const stats = fs.statSync(fullPath);
        return {
          fileName: file,
          mtime: stats.mtime,
          mtimeMs: stats.mtimeMs,
          downloadLink: `http://localhost:8080/file/download-file/${file}`,
          viewLink: `http://localhost:8080/file/view-file/${file}`
          
        };
      })
      .filter(file => {
        const timeDiffInHours = (now - file.mtimeMs) / (1000 * 60 * 60);
        return timeDiffInHours <= timeWindowInHours;
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs); // Newest first

    if (recentFiles.length === 0) {
      return res.status(404).json({ message: 'No recent files found' });
    }

    res.status(200).json({ recentFiles });
  });
});





router.post('/upload-template', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const targetPath = path.join(prop, file.originalname);
  fs.renameSync(file.path, targetPath); // Move to TemplatesDocs/Docs

  res.status(200).json({ message: 'Template uploaded', file: file.originalname });
});
router.get('/download-template/:filename', (req, res) => {
  const filePath = path.join(prop, req.params.filename);
  if (fs.existsSync(filePath)) res.download(filePath);
  else res.status(404).json({ error: 'File not found' });
});
router.get('/view-template/:filename', (req, res) => {
  const filePath = path.join(prop, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${req.params.filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } else res.status(404).json({ error: 'File not found' });
});
router.delete('/delete-template/:filename', (req, res) => {
  const filePath = path.join(prop, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlinkSync(filePath);
  res.status(200).json({ message: 'Template deleted successfully' });
});


module.exports = router;




// ✅ Get the most recently uploaded file
// router.get('/recently-uploaded', (req, res) => {
//   fs.readdir(proposalsPath, (err, files) => {
//     if (err) {
//       console.error('Error reading folder:', err);
//       return res.status(500).json({ error: 'Unable to list files' });
//     }
//     if (files.length === 0) {
//       return res.status(404).json({ message: 'No files found' });
//     }

//     const latestFile = files
//       .map(file => ({
//         name: file,
//         time: fs.statSync(path.join(proposalsPath, file)).mtime.getTime()
//       }))
//       .sort((a, b) => b.time - a.time)[0];

//     res.status(200).json({ file: latestFile.name });
//   });
// });


// 🗑️ Delete a PDF file
// router.delete('/delete-file/:filename', (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(proposalsPath, filename);

//   if (fs.existsSync(filePath)) {
//     fs.unlink(filePath, (err) => {
//       if (err) {
//         console.error('Error deleting file:', err);
//         return res.status(500).json({ error: 'Unable to delete file' });
//       }
//       res.status(200).json({ message: 'File deleted successfully' });
//     });
//   } else {
//     res.status(404).json({ error: 'File not found' });
//   }
// });

// fetch the recently uploaded file
// router.get('/recently-uploaded', (req, res) => {
//   fs.readdir(proposalsPath, (err, files) => {
//     if (err) {
//       console.error('Error reading folder:', err);
//       return res.status(500).json({ error: 'Unable to list files' });
//     }
//     if (files.length === 0) {
//       return res.status(404).json({ message: 'No files found' });
//     }
//     const latestFile = files.sort((a, b) => fs.statSync(path.join(proposalsPath, b)).mtime - fs.statSync(path.join(proposalsPath, a)).mtime)[0];
//     res.status(200).json({ file: latestFile });
//   });
// });
