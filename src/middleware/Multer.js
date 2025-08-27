import multer from 'multer'
import fs from 'fs'

export const allowedExtensions = {
  image: ["image/jpeg", "image/png"],
  video: ['video/mp4'],
  pdf: ['application/pdf']

}

export const MulterLocal = ({customPath = 'generals', customExtensions = []}= {}) =>{
  const fullPath = `uploads/${customPath}`
  if(!fs.existsSync(fullPath)){
    fs.mkdirSync(fullPath, {recursive: true})
  }
  const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, fullPath )
  },
  filename: function (req, file, cb) {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "_" + file.originalname)
  }
})

function fileFilter (req, file, cb) {  
  if(!customExtensions.includes(file.mimetype)){
  cb(new Error('InValid File'))
  }else{
  cb(null, true)
  }
}

const upload = multer({ storage, fileFilter })
return upload
}

export const MulterHost = ({customExtensions = []}= {}) =>{
  const storage = multer.diskStorage({})

function fileFilter (req, file, cb) {  
  if(!customExtensions.includes(file.mimetype)){
  cb(new Error('InValid File'))
  }else{
  cb(null, true)
  }
}

const upload = multer({ storage, fileFilter })
return upload
}