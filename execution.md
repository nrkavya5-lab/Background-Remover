# Execution Plan — Blocks & Subblocks

---

## BLOCK 0 — Project Scaffolding

### 0.1 Initialize project structure
- Create root folders: `client/`, `server/`, `shared/`
- Initialize `package.json` for both client and server
- Create `.gitignore`, `README.md`

### 0.2 Setup backend skeleton
- `npm init` in server/
- Install: `express`, `mongoose`, `dotenv`, `cors`, `multer`, `sharp`, `axios`, `archiver`, `jsonwebtoken`, `bcryptjs`
- Create `server/app.js` entry point
- Create `server/config/db.js` — MongoDB connection (optional, can skip for API-based)
- Create `.env` file template with API keys

### 0.3 Setup frontend skeleton
- Create React app with Vite in client/
- Install: `react-router-dom`, `axios`, `react-dropzone`, `react-easy-crop`, `recharts`, `file-saver`, `jszip`
- Tailwind CSS setup with `tailwind.config.js`
- Create folder structure: `components/`, `pages/`, `hooks/`, `context/`, `services/`, `utils/`
- Setup `App.jsx` with React Router

### 0.4 Setup shared utilities
- Create `utils/constants.js` — image formats, quality presets, limits
- Create `utils/validators.js` — file type/size validation
- Create `utils/helpers.js` — formatting, download helpers

---

## BLOCK 1 — Image Upload Module

### 1.1 Backend — Upload endpoint
- Install and configure Multer for file uploads
- Create `server/routes/upload.js`:
  - `POST /api/upload` — upload single image
  - `POST /api/upload/multiple` — upload multiple images
- Validate file type (JPG, PNG, WEBP) and size (max 20MB)
- Store files in `server/uploads/` temp directory
- Return file path, name, size, type

### 1.2 Frontend — Upload components
- Create `components/UploadBox.jsx` — drag-and-drop zone with react-dropzone
- Create `components/ImagePreview.jsx` — preview uploaded image with zoom
- Create `pages/Home.jsx` — hero section with upload area
- Add file type/size validation on client side
- Show upload progress with loading indicator
- Create `hooks/useImageUpload.js` — custom hook for upload logic

---

## BLOCK 2 — Background Removal (Core)

### 2.1 Backend — remove.bg API integration
- Create `server/services/removeBgService.js`:
  - Call remove.bg API with image buffer
  - Handle API key from env
  - Return processed image buffer
- Create `server/routes/process.js`:
  - `POST /api/remove-bg` — remove background from uploaded image
  - `POST /api/remove-bg/multiple` — batch background removal
- Error handling: API limits, invalid images, timeouts

### 2.2 Frontend — Processing UI
- Create `components/ResultPreview.jsx` — show processed transparent PNG
- Create `components/ProcessingOverlay.jsx` — spinner with status messages
- Create `components/DownloadButton.jsx` — download transparent PNG
- Wire upload → processing → result flow in `pages/Editor.jsx`
- Add retry button on failure

---

## BLOCK 3 — Background Replacement

### 3.1 Backend — Background replacement
- Create `server/routes/replace-bg.js`:
  - `POST /api/replace-bg` — replace with color/hex
  - `POST /api/replace-bg/gradient` — replace with gradient
  - `POST /api/replace-bg/image` — replace with custom image
- Use Sharp for compositing images over backgrounds

### 3.2 Frontend — Background picker
- Create `components/BackgroundPicker.jsx`:
  - Color picker (preset colors + custom hex)
  - Gradient presets
  - Upload custom background image
- Create color swatches UI with preview
- Wire to editor page for real-time preview

---

## BLOCK 4 — Before/After Preview

### 4.1 Frontend — Comparison slider
- Create `components/BeforeAfterSlider.jsx`:
  - Side-by-side toggle
  - Drag slider to compare
  - Smooth transition animation
- Create `components/BeforeAfterToggle.jsx` — quick side-by-side view
- Integrate into editor page

---

## BLOCK 5 — Image Editor

### 5.1 Backend — Image manipulation APIs
- Create `server/routes/edit.js`:
  - `POST /api/edit/crop` — crop image
  - `POST /api/edit/resize` — resize with dimensions
  - `POST /api/edit/rotate` — rotate by degrees
  - `POST /api/edit/adjust` — brightness, contrast, blur
- Use Sharp for all image manipulation operations

### 5.2 Frontend — Editor controls
- Create `components/ImageEditor.jsx`:
  - Crop tool (react-easy-crop)
  - Resize inputs (width/height)
  - Rotate slider (0-360)
  - Adjust sliders (brightness, contrast, blur)
- Real-time preview of edits
- Reset button for each adjustment

---

## BLOCK 6 — Download & Export

### 6.1 Backend — Download endpoint
- Create `server/routes/download.js`:
  - `GET /api/download/:filename` — serve processed file
  - `POST /api/download/compress` — compress and return
- Quality options: Low (70%), Medium (85%), HD (95%), Ultra HD (100%)

### 6.2 Frontend — Download UI
- Update `components/DownloadButton.jsx`:
  - Quality selector dropdown
  - Format selector (PNG, JPG, WEBP)
  - File size estimate
- Create `components/QualitySelector.jsx` — quality radio buttons
- Download with file-saver or direct link

---

## BLOCK 7 — Batch Processing

### 7.1 Backend — Batch APIs
- Create `server/routes/batch.js`:
  - `POST /api/batch/upload` — upload multiple files
  - `POST /api/batch/process` — process all queued images
  - `GET /api/batch/status/:batchId` — check processing status
  - `GET /api/batch/download/:batchId` — download ZIP
- Implement async processing queue
- Use archiver for ZIP creation

### 7.2 Frontend — Batch page
- Create `pages/Batch.jsx` — multi-upload with file list
- Create `components/batch/BatchQueue.jsx` — progress per file
- Create `components/batch/BatchProgressBar.jsx` — overall progress
- Show individual status (pending, processing, done, failed)
- Download all as ZIP button

---

## BLOCK 8 — Authentication

### 8.1 Backend — Auth APIs
- Create `server/models/User.js` — user schema (name, email, password, imageCount, role, createdAt)
- Create `server/routes/auth.js`:
  - `POST /api/auth/register` — register
  - `POST /api/auth/login` — login, return JWT
  - `POST /api/auth/google` — Google OAuth
  - `GET /api/auth/me` — current user
  - `PUT /api/auth/profile` — update profile
- Create `server/middleware/auth.js` — JWT verification
- Guest user tracking with session ID

### 8.2 Frontend — Auth UI
- Create `pages/Login.jsx` — login form
- Create `pages/Register.jsx` — registration form
- Create `components/AuthGuard.jsx` — protected route wrapper
- Create `context/AuthContext.jsx` — auth state with JWT/ Firebase
- Google login button integration
- Guest usage tracking (localStorage)

---

## BLOCK 9 — Dashboard & History

### 9.1 Backend — User data APIs
- Create `server/routes/user.js`:
  - `GET /api/user/history` — processed images history
  - `DELETE /api/user/history/:id` — delete history item
  - `GET /api/user/stats` — usage statistics
- Create `server/models/ProcessedImage.js` — image metadata schema

### 9.2 Frontend — Dashboard pages
- Create `pages/Dashboard.jsx`:
  - Stats cards (total processed, storage used, credits remaining)
  - Recent activity timeline
  - Quick upload button
- Create `pages/History.jsx`:
  - Grid of all processed images with thumbnails
  - Search and filter
  - Re-download or edit again

---

## BLOCK 10 — Admin Analytics Dashboard

### 10.1 Backend — Admin APIs
- Create `server/routes/admin.js`:
  - `GET /api/admin/stats` — total uploads, users, API calls
  - `GET /api/admin/users` — user list with usage
  - `GET /api/admin/daily-usage` — daily processing counts (for charts)
  - `GET /api/admin/revenue` — if monetized, revenue data
- Role-based admin middleware

### 10.2 Frontend — Admin page
- Create `pages/Admin.jsx`:
  - Overview stats cards
  - Daily uploads chart (recharts line chart)
  - User growth chart
  - API usage breakdown pie chart
  - Recent users table
  - Export analytics as CSV

---

## BLOCK 11 — Advanced Features

### 11.1 Passport Photo Generator
- Create `pages/Passport.jsx`:
  - Upload portrait photo
  - Auto remove background (reuse core)
  - Select country for size preset (US, UK, India, etc.)
  - Preview with guide overlay
  - Download 4x6 print sheet with multiple photos

### 11.2 Product Photo Creator
- Create `pages/Product.jsx`:
  - Upload product image
  - Remove background
  - Add white/gradient background
  - Add shadow effect
  - Add reflection effect
  - Download HD product photo

### 11.3 AI Thumbnail Maker
- Create `pages/Thumbnail.jsx`:
  - Upload image
  - Remove background
  - Add text overlay (title, subtitle)
  - Choose template (YouTube, social media)
  - Download thumbnail

---

## BLOCK 12 — UI Polish & Responsive Design

### 12.1 Global Styles
- Configure Tailwind theme with custom colors, fonts
- Create dark mode with Tailwind `dark:` variant
- Add smooth page transitions (framer-motion)
- Responsive grid layouts for all pages

### 12.2 Component Library
- Create `components/common/Button.jsx` — variants (primary, secondary, ghost, danger)
- Create `components/common/Modal.jsx` — reusable modal
- Create `components/common/Toast.jsx` — notification system
- Create `components/common/Loader.jsx` — loading spinner/skeleton
- Create `components/common/EmptyState.jsx` — empty state illustrations

### 12.3 Navigation & Layout
- Create `components/layout/Navbar.jsx` — top bar with logo, nav links, auth buttons
- Create `components/layout/Footer.jsx` — simple footer
- Create `components/layout/Layout.jsx` — main layout wrapper
- Mobile responsive navigation (hamburger menu)

---

## BLOCK 13 — Performance & Optimization

### 13.1 Image optimization
- Compress uploaded images before processing
- Implement image caching (processed results)
- Lazy loading for history grid
- CDN for static assets

### 13.2 Backend optimization
- Rate limiting per user/IP
- Image cleanup cron job (delete old temp files)
- Connection pooling for database
- Request queue for API calls

---

## BLOCK 14 — Testing & Deployment

### 14.1 Backend Testing
- Test upload endpoint (valid/invalid files)
- Test background removal API integration
- Test download endpoint
- Test auth endpoints

### 14.2 Frontend Testing
- Test upload component renders
- Test editor page flow
- Test responsive layouts
- Test auth flow (login/register)

### 14.3 Deployment
- Frontend: Build with Vite, deploy to Vercel
- Backend: Deploy to Render/Railway
- Set environment variables (API keys, JWT secret, DB URI)
- Configure CORS for production
- Domain setup (optional)
