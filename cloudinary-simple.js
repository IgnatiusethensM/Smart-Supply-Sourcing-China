// Simple Cloudinary Upload
// Add to package.json: "cloudinary": "^1.41.0", "multer": "^1.4.5-lts.1"

const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure with YOUR credentials from dashboard
cloudinary.config({
  cloud_name: 'YOUR_CLOUD_NAME',  // Replace with yours
  api_key: 'YOUR_API_KEY',        // Replace with yours  
  api_secret: 'YOUR_API_SECRET'   // Replace with yours
});

// File upload setup
const upload = multer({ dest: 'temp/' });

// Add this route to your server.js
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'products',  // Organizes your images
      width: 800,          // Resize to 800px wide
      height: 600,         // Resize to 600px tall
      crop: 'fill'         // Smart cropping
    });
    
    // Return the URL
    res.json({ 
      success: true,
      url: result.secure_url  // This is what you save to database
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Usage: Upload file → Get URL → Save URL to MongoDB