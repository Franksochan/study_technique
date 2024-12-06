const multer = require("multer")
const path = require("path")

const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100000000 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).array("files", 12)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100000000 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).single("file") 

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif|pdf/;
  const extName = path.extname(file.originalname).toLowerCase()
  const mimeType = fileTypes.test(file.mimetype)

  console.log('Original filename:', file.originalname)
  console.log('Detected file extension:', extName)

  if (mimeType) {
    return cb(null, true);
  } else {
    cb("Error: Images and PDFs only!")
  }
}


module.exports = { uploadMultiple, upload }