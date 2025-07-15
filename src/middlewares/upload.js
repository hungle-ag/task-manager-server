import { v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'
import multer from 'multer'
import sharp from 'sharp'
import streamifier from 'streamifier'

config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const upload = multer({ storage: multer.memoryStorage() })

function compressImageToTargetSize(buffer, targetSizeKB) {
  if (buffer.length <= targetSizeKB * 1024) return Promise.resolve(buffer)
  return sharp(buffer).jpeg({ quality: 65 }).toBuffer()
}

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const fullFolder = `task-manager/${folder}`
    const stream = cloudinary.uploader.upload_stream(
      { folder: fullFolder, format: 'jpg' },
      (err, result) => {
        if (err || !result) return reject(err)
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      },
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

export function uploadMiddleware({ fieldName, folder, width, targetSizeKB = 200, square = false }) {
  return [
    upload.single(fieldName),

    async (req, res, next) => {
      try {
        const file = req.file
        if (!file) return next()

        // Resize image
        const resizedImage = sharp(file.buffer).resize(
          square ? { width, height: width, fit: 'cover' } : { width, fit: 'inside' },
        )

        const initialBuffer = await resizedImage.jpeg({ quality: 80 }).toBuffer()
        const compressedBuffer = await compressImageToTargetSize(initialBuffer, targetSizeKB)

        const { url, publicId } = await uploadToCloudinary(compressedBuffer, folder)

        req.body[`${fieldName}Url`] = url
        req.body[`${fieldName}PublicId`] = publicId

        next()
      } catch (error) {
        console.error('Image upload error:', {
          field: fieldName,
          error,
        })
        return res.status(500).json({ error: 'Image upload failed.' })
      }
    },
  ]
}
