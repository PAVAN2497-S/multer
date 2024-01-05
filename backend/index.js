const express = require('express')
const cors = require('cors')
const app = express()
const configureDB = require('../backend/config/db')
const multer = require('multer')
const path = require('path')
const User = require('./app/model/imageSchema')
app.use(express.json())
app.use(cors())
configureDB()


app.use('/public/images', express.static('public/images'))
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'public/images')
   },
   filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
   },
})

const upload = multer({
   storage,
   limits: { fileSize: 1 * 1024 * 1024 },
   fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/
      const mimetype = filetypes.test(file.mimetype)
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

      if (mimetype && extname) {
         return cb(null, true)
      } else {
         cb('Error: Only JPEG/JPG and PNG files are allowed!')
      }
   },
})

app.post('/upload', (req, res) => {
   upload.single('file')(req, res, async (err) => {
      //console.log(err)
      if (err instanceof multer.MulterError) {
         return res.status(400).json(err)
      } else if (err) {
         return res.status(500).json({msg:err})
      }
      try {
         const result = await User.create({ image: req.file.filename })
         return res.json(result)
      } catch (e) {
         return res.status(500).json({ error: 'Server error while uploading filee' })
      }
   })
})

app.get('/image/:id', async (req, res) => {
   try {
      const id = req.params.id
      const imageDetails = await User.findById(id)
      if (!imageDetails) {
         return res.status(404).json({ error: 'Image not found' })
      }
      res.sendFile(path.join(__dirname, `public/images/${imageDetails.image}`))
   } catch (error) {
      res.status(500).json({ error: 'Server error while fetching image' })
   }
})



app.delete('/image/delete/:id', async (req, res) => {
   try {
      const id = req.params.id
      const imageDetails = await User.findById(id)
      if (!imageDetails) {
         return res.status(404).json({ error: 'Image not found' })
      }
      await User.findByIdAndDelete(id)
      res.json({ message: 'Image deleted successfully' })
   } catch (error) {
      res.status(500).json({ error: 'Server error while deleting image' })
   }
})
   

app.listen(443, () => {
   console.log('Server running')
})
