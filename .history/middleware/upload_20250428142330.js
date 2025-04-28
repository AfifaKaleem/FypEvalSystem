const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Folder setup (absolute path based on project root)
const proposalsPath = path.join(process.cwd(), 'uploads', 'proposals');
if (!fs.existsSync(proposalsPath)) {
  fs.mkdirSync(proposalsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proposalsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
