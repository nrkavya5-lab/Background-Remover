# Background Remover — Documentation

## About the Project

Background Remover is a full-stack web application that lets users remove and replace image backgrounds using AI. It provides a user-friendly drag-and-drop interface with real-time preview, an image editor, batch processing, and optional user accounts with history tracking.

The app uses **remove.bg API** as the primary background removal engine with automatic fallback to **Clipdrop API** for reliability. Image manipulation (background replacement, resizing, cropping) is handled by **Sharp** on the server side.

## How It Was Built

### Architecture

The project follows a monorepo structure with two main directories:

```
client/  — React SPA built with Vite
server/  — Express.js REST API
```

The frontend communicates with the backend via HTTP requests proxied through Vite in development. The backend processes images using Sharp and external AI APIs, serving results back to the client.

### Build Process

#### Phase 1 — Foundation
- Scaffolded project with Express backend and Vite + React + Tailwind frontend
- Configured Tailwind dark mode with `class` strategy
- Set up Vite proxy for `/api` and `/uploads` routes
- Created shared utilities and constants

#### Phase 2 — Core API Integration
- Built `removeBgService.js` with dual-provider support (remove.bg + Clipdrop)
  - Tries remove.bg first, falls back to Clipdrop on failure
  - Clear error messages for invalid API keys
- Created upload route with Multer (20MB limit, JPG/PNG/WebP only)
- Implemented background replacement using Sharp compositing
  - Solid color fills
  - Linear/radial gradients
  - Custom image overlays

#### Phase 3 — Frontend UI
- Built drag-and-drop upload component with zoom preview
- Created Editor page with:
  - Before/after slider and toggle comparison
  - Image editor (crop, resize, rotate, adjust)
  - Background picker (none/color/gradient/image tabs)
- Added download button with quality/format selector
- Responsive design with mobile support

#### Phase 4 — Advanced Features
- Batch processing queue — upload up to 20 files, async processing with polling, ZIP download
- User authentication (register, login, Google OAuth, JWT)
- Dashboard with usage statistics
- History page with search, filter, delete
- Admin panel with analytics charts (recharts)
- Advanced tools: passport photo, product photo, thumbnail generator

#### Phase 5 — Polish
- Rate limiting on all routes (general, upload, auth, API)
- Upload compression for large files
- Hourly cleanup cron for old uploads (>24h)
- Toast notification system
- Loading states, empty states, error handling

## Features and How to Use Them

### 1. Background Removal

**How to use:**
1. Go to the Home page
2. Drag an image or click to upload (JPG, PNG, or WebP, max 20MB)
3. The image opens in the Editor with background automatically removed
4. Use the **Before/After** toggle or slider to compare

**Behind the scenes:** The image is sent to `/api/remove-bg` which calls remove.bg API. If remove.bg fails, it automatically falls back to Clipdrop. The processed image is returned and displayed.

### 2. Background Replacement

**How to use:**
1. After background removal, click the **Background** tab
2. Choose from:
   - **None** — Keep transparent background (downloads as PNG)
   - **Color** — Pick from 15 presets or use the color picker
   - **Gradient** — Choose from 6 gradient presets
   - **Image** — Upload a custom background image
3. The preview updates in real time

**Behind the scenes:** The `/api/replace-bg` endpoint composites the foreground image over the chosen background using Sharp.

### 3. Image Editor

**How to use:**
1. Click the **Edit** tab in the Editor
2. Choose a tool:
   - **Crop** — Drag to select area or use preset ratios (1:1, 4:3, 16:9)
   - **Resize** — Enter custom width/height or pick presets
   - **Rotate** — Rotate 90°, flip horizontal/vertical, or custom angle
   - **Adjust** — Brightness and contrast sliders (-100 to +100)
3. Each tab has its own **Reset** button

**Behind the scenes:** Adjustments are applied via CSS for preview. When you download, the `/api/edit` endpoint applies transformations using Sharp.

### 4. Batch Processing

**How to use:**
1. Click **Batch** in the navigation
2. Upload up to 20 images at once
3. Click **Process All** to start background removal
4. Monitor progress with the progress bar
5. Click **Download ZIP** when complete

**Behind the scenes:** Each image is queued and processed sequentially on the server. The client polls `/api/batch/status/:id` for updates. The final ZIP is generated using the `archiver` library.

### 5. User Authentication

**How to use:** (Requires MongoDB)
1. Click **Login** or **Register** in the navigation
2. Register with name, email, and password (min 6 characters)
3. Or click **Sign in with Google** for OAuth
4. Once logged in, your edits are saved to history

**Behind the scenes:** Passwords are hashed with bcryptjs (12 salt rounds). JWTs are generated on login/register and stored in localStorage. The auth middleware verifies tokens on protected routes.

### 6. Dashboard & History

**How to use:** (Requires MongoDB, must be logged in)
1. **Dashboard** — View your usage statistics (total edits, images processed, storage used)
2. **History** — Browse past edits with search, filter by type, and delete individual items

**Behind the scenes:** Each processed image is saved to the `ProcessedImage` model with metadata (type, file size, filters applied).

### 7. Admin Panel

**How to use:** (Requires MongoDB, admin role)
1. Navigate to `/admin`
2. View analytics charts for daily usage and revenue
3. Manage users table with search and role badges
4. Export data as CSV

**Behind the scenes:** Admin routes are protected by `AdminGuard` middleware checking for `role: 'admin'`. Charts use recharts with data from aggregated database queries.

### 8. Advanced Tools

#### Passport Photo Generator
- Select country and passport size preset
- Auto-crops to required dimensions
- Applies white background and proper spacing

#### Product Photo Creator
- Removes background from product images
- Adds shadow and reflection effects
- Multiple product shot presets

#### Thumbnail Maker
- Generates social media thumbnails
- YouTube, Twitter, Instagram presets
- Custom text overlay support

### 9. Download Options

**How to use:**
1. After editing, click the **Download** button
2. Select format: PNG (lossless), JPEG (smaller), or WebP (modern)
3. Adjust quality slider (1-100)
4. Click to download

**Behind the scenes:** The `/api/download` endpoint uses Sharp to convert and compress the image based on format and quality parameters.

## API Endpoints

| Method | Endpoint               | Description                    | Auth Required |
|--------|------------------------|--------------------------------|---------------|
| POST   | `/api/upload`          | Upload image file              | No            |
| POST   | `/api/remove-bg`       | Remove background              | No            |
| POST   | `/api/replace-bg`      | Replace background             | No            |
| POST   | `/api/replace-bg-from-url` | Replace from URL           | No            |
| POST   | `/api/edit`            | Edit image (crop/resize/etc)   | No            |
| POST   | `/api/download`        | Download processed image       | No            |
| POST   | `/api/compress`        | Compress with quality          | No            |
| POST   | `/api/batch`           | Start batch processing         | No            |
| GET    | `/api/batch/status/:id`| Check batch status             | No            |
| GET    | `/api/batch/download/:id` | Download batch ZIP          | No            |
| POST   | `/api/auth/register`   | Register new user              | No            |
| POST   | `/api/auth/login`      | Login                          | No            |
| GET    | `/api/auth/google`     | Google OAuth URL               | No            |
| GET    | `/api/auth/me`         | Get current user profile       | Yes           |
| PUT    | `/api/auth/profile`    | Update profile                 | Yes           |
| GET    | `/api/user/stats`      | User dashboard stats           | Yes           |
| GET    | `/api/user/history`    | User edit history (paginated)  | Yes           |
| DELETE | `/api/user/history/:id`| Delete history entry           | Yes           |
| GET    | `/api/admin/stats`     | Admin analytics                | Admin         |
| GET    | `/api/admin/users`     | List all users                 | Admin         |
| DELETE | `/api/admin/users/:id` | Delete user                    | Admin         |
| POST   | `/api/advanced/passport` | Generate passport photo     | No            |
| POST   | `/api/advanced/product`  | Generate product photo      | No            |
| POST   | `/api/advanced/thumbnail`| Generate thumbnail         | No            |

## Environment Variables

| Variable          | Required | Description                                     |
|-------------------|----------|-------------------------------------------------|
| `PORT`            | No       | Server port (default: 5000)                     |
| `NODE_ENV`        | No       | Environment (development/production)             |
| `MONGODB_URI`     | No*      | MongoDB connection string                       |
| `REMOVE_BG_API_KEY` | No     | remove.bg API key (primary provider)            |
| `CLIPDROP_API_KEY` | Yes     | Clipdrop API key (fallback provider)            |
| `JWT_SECRET`      | No*      | JWT signing secret (required if using auth)     |
| `JWT_EXPIRES_IN`  | No       | Token expiry (default: 7d)                      |
| `CLIENT_URL`      | No       | Frontend URL for CORS (default: localhost:5173)  |

\* Required only for specific features (auth, admin, history).

## Deployment

### To Vercel + Render

1. Push the code to GitHub
2. Deploy `client/` to Vercel (set build command to `cd .. && npm install && npm run build`, output to `dist`)
3. Deploy `server/` to Render as a Web Service
4. Set environment variables on Render
5. Update `CLIENT_URL` in Render env to your Vercel URL

### Docker

```bash
docker build -t background-remover .
docker run -p 5000:5000 --env-file server/.env background-remover
```
