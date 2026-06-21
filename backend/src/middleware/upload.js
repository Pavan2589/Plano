const multer = require('multer');
const { ValidationError } = require('../utils/errors');

// Memory storage is preferred since we resize images using Sharp before uploading to MinIO
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only JPEG, PNG, WEBP files
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, PNG, and WEBP shelf images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
