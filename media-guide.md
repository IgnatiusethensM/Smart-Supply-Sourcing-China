# Adding Pictures and Videos Guide

## Method 1: Local Files (Recommended for Start)

### Setup:
```
Downloads/
├── images/
│   ├── products/
│   ├── gallery/
│   └── logos/
├── videos/
│   ├── product-demos/
│   └── company/
└── your-html-files
```

### Usage in HTML:
```html
<!-- Images -->
<img src="images/products/headphones.jpg" alt="Wireless Headphones">
<img src="images/gallery/factory-tour.jpg" alt="Factory Tour">

<!-- Videos -->
<video controls width="100%">
    <source src="videos/product-demos/demo1.mp4" type="video/mp4">
</video>
```

## Method 2: Cloud Storage (Best for Production)

### Free Options:
- **Cloudinary** (free tier: 25GB)
- **ImageKit** (free tier: 20GB)
- **Firebase Storage** (free tier: 5GB)

### Usage:
```html
<img src="https://res.cloudinary.com/your-account/image/upload/v1234567890/product1.jpg">
<video src="https://res.cloudinary.com/your-account/video/upload/v1234567890/demo.mp4" controls></video>
```

## Method 3: File Upload System (Advanced)

Add to your backend server for admin uploads:

```javascript
// In server.js - File upload endpoint
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});
```

## Quick Start (Method 1):

1. Create `images/` and `videos/` folders in Downloads
2. Add your files there
3. Reference them in HTML: `src="images/your-file.jpg"`
4. For products, update database with local paths

## Recommended Sizes:
- **Product images**: 800x600px, under 200KB
- **Gallery images**: 1200x800px, under 500KB  
- **Videos**: 1080p, under 50MB, MP4 format