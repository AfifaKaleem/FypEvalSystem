// Example multer config
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/proposals'); // or wherever you're storing them
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, uniqueName);
    }
});

// File filter (optional, can log file info here for debugging)
const fileFilter = (req, file, cb) => {
    console.log('📎 File received:', file.fieldname);
    cb(null, true);
};

const fileUpload = multer({ storage, fileFilter });

module.exports = fileUpload;
