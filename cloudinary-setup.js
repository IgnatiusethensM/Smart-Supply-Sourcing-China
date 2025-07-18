// Cloudinary Media Upload Setup
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'your-cloud-name', // Get from cloudinary.com
  api_key: 'your-api-key',
  api_secret: 'your-api-secret'
});

// Multer for file uploads
const upload = multer({ dest: 'temp/' });

// Add to your server.js
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'products',
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
    
    res.json({ 
      url: result.secure_url,
      public_id: result.public_id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Usage in admin dashboard:
// 1. Upload image via form
// 2. Get Cloudinary URL
// 3. Save URL to MongoDB (not the file)
// 4. Display image using URL