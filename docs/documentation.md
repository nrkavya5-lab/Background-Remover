# Background Remover — Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Installation Guide](#installation-guide)
4. [Configuration](#configuration)
5. [Features](#features)
6. [API Endpoints](#api-endpoints)
7. [Project Structure](#project-structure)
8. [Architecture Overview](#architecture-overview)
9. [Docker Deployment](#docker-deployment)
10. [Testing](#testing)
11. [License](#license)

---

## Overview

Background Remover is a full-stack web application that removes and replaces image backgrounds using AI. It provides a drag-and-drop interface with real-time preview, an image editor, batch processing, user account management, and advanced tools such as a passport photo generator, product photo creator, and thumbnail maker.

The application uses **remove.bg API** as the primary background removal engine with automatic fallback to **Clipdrop API** for reliability. Image manipulation tasks such as background replacement, resizing, cropping, and format conversion are handled by **Sharp** on the server side.

---

## Tech Stack

| Layer         | Technology                                                                    |
|---------------|-------------------------------------------------------------------------------|
| Frontend      | React 18, Vite 5, Tailwind CSS 3, Recharts 2                                  |
| Backend       | Express.js 4, Node.js 20                                                      |
| Image Processing | Sharp 0.33, remove.bg API, Clipdrop API                                    |
| Authentication | JWT, bcryptjs, Google OAuth                                                  |
| Database      | MongoDB, Mongoose 8 (optional)                                                |
| Bundler       | Vite 5                                                                        |
| Testing       | Vitest 4 (frontend), Node Test Runner (backend)                               |
| Deployment    | Vercel (frontend), Render (backend), Docker                                   |

---

## Installation Guide

### Prerequisites

- Node.js 18 or higher
- npm
- (Optional) MongoDB instance for auth, dashboard, history, and admin features
- (Optional) API keys for remove.bg and/or Clipdrop

### Clone the Repository

```bash
git clone https://github.com/nrkavya5-lab/Background-Remover.git
cd Background-Remover
```

### Install Dependencies

```bash
# Install root-level dev dependency (concurrently)
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### Environment Setup

```bash
cp .env.example server/.env
```

Edit `server/.env` and add your API keys (see [Configuration](#configuration) below).

### Run in Development

```bash
npm run dev
```

This starts both the Vite frontend on port 5173 and the Express backend on port 5000. Open [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
npm run build
```

Produces static files in `client/dist/` ready for deployment.

---

## Configuration

All environment variables are defined in `server/.env` (copied from `.env.example` at the project root).

| Variable              | Required | Default                | Description                                               |
|-----------------------|----------|------------------------|-----------------------------------------------------------|
| `PORT`                | No       | `5000`                 | Server port                                               |
| `NODE_ENV`            | No       | `development`          | Environment mode (`development` or `production`)          |
| `MONGODB_URI`         | No\*     | —                      | MongoDB connection string                                 |
| `REMOVE_BG_API_KEY`   | No       | —                      | remove.bg API key (serves as primary provider)            |
| `CLIPDROP_API_KEY`    | Yes\*\*  | —                      | Clipdrop API key (serves as fallback provider)            |
| `JWT_SECRET`          | No\*     | —                      | Secret key for signing JSON Web Tokens                    |
| `JWT_EXPIRES_IN`      | No       | `7d`                   | JWT token expiration duration                             |
| `CLIENT_URL`          | No       | `http://localhost:5173`| Allowed CORS origin for the frontend                      |

\* Required only when using authentication, dashboard, history, or admin features.

\*\* At least one of `CLIPDROP_API_KEY` or `REMOVE_BG_API_KEY` must be configured for background removal to work.

### Getting API Keys

- **Clipdrop**: Sign up at [https://clipdrop.co/apis](https://clipdrop.co/apis) for a free API key.
- **remove.bg**: Register at [https://www.remove.bg/api](https://www.remove.bg/api) to obtain an API key.
- **MongoDB**: Provision a free cluster at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) or use a local MongoDB instance.

---

## Features

### 1. Background Removal

Upload an image (JPG, PNG, WebP; max 20 MB) and remove its background with a single click. The server first attempts removal via the remove.bg API. If that fails, it automatically falls back to Clipdrop. The result is displayed in the editor with a before/after comparison.

**Files involved:**
- `server/services/removeBgService.js` — Dual-provider background removal logic
- `server/routes/process.js` — `/api/remove-bg` endpoint
- `client/src/components/UploadBox.jsx` — Drag-and-drop upload component
- `client/src/components/BeforeAfterSlider.jsx` — Visual comparison slider

### 2. Background Replacement

After removal, replace the transparent background with:
- **Solid colors** — Choose from 15 presets or use a custom color picker
- **Gradients** — Six linear and radial gradient presets
- **Custom images** — Upload any image as the new background

All compositing is performed server-side using Sharp.

**Files involved:**
- `server/services/bgReplaceService.js` — Color, gradient, and image compositing
- `server/routes/replace-bg.js` — `/api/replace-bg` endpoint
- `client/src/components/BackgroundPicker.jsx` — Background selection UI

### 3. Image Editor

Built-in editing tools:
- **Crop** — Freeform drag selection or preset aspect ratios (1:1, 4:3, 16:9)
- **Resize** — Custom width/height or predefined size presets
- **Rotate** — 90-degree rotations, horizontal/vertical flips, custom angle
- **Adjust** — Brightness and contrast sliders (-100 to +100)

Adjustments are previewed using CSS transforms; the final image is rendered server-side via Sharp when downloaded.

**Files involved:**
- `server/routes/edit.js` — `/api/edit` endpoint
- `client/src/components/ImageEditor.jsx` — Editor UI with tabs
- `client/src/pages/Editor.jsx` — Main editor page

### 4. Before/After Slider

Compare the original and processed images side by side using either a slider handle or a toggle button. The comparison updates in real time after any edit.

**Files involved:**
- `client/src/components/BeforeAfterSlider.jsx` — Draggable slider component
- `client/src/components/BeforeAfterToggle.jsx` — Toggle switch component

### 5. Batch Processing

Process up to 20 images simultaneously. Upload multiple files, click "Process All", and monitor progress via a progress bar. Once complete, download all results as a single ZIP archive.

**Files involved:**
- `server/routes/batch.js` — Batch processing endpoints
- `client/src/components/batch/BatchQueue.jsx` — Queue management UI
- `client/src/components/batch/BatchProgressBar.jsx` — Progress indicator
- `client/src/pages/Batch.jsx` — Batch processing page

### 6. Download Options

Download processed images in three formats:
- **PNG** — Lossless, supports transparency
- **JPEG** — Smaller file size, no transparency
- **WebP** — Modern format with good compression

Adjust quality from 1 to 100 via a slider.

**Files involved:**
- `server/routes/download.js` — `/api/download` endpoint
- `client/src/components/DownloadButton.jsx` — Download UI with format/quality selector
- `client/src/components/QualitySelector.jsx` — Quality slider

### 7. User Authentication

Register an account or log in with email and password. Passwords are hashed with bcryptjs (12 salt rounds). JWT tokens are issued upon successful authentication and stored in localStorage. Google OAuth is also supported.

Protected routes redirect unauthenticated users to the login page.

**Files involved:**
- `server/routes/auth.js` — Register, login, Google OAuth endpoints
- `server/middleware/auth.js` — JWT verification middleware
- `client/src/context/AuthContext.jsx` — Auth state management
- `client/src/components/AuthGuard.jsx` — Route protection component
- `client/src/pages/Login.jsx` — Login page
- `client/src/pages/Register.jsx` — Registration page

### 8. Dashboard and History

View personal usage statistics, browse past edits, and manage history.
- **Dashboard** — Total edits, images processed, storage used
- **History** — Paginated list of past edits with search, filter by type, and delete

Both features require MongoDB and an authenticated session.

**Files involved:**
- `server/routes/user.js` — `/api/user/stats` and `/api/user/history` endpoints
- `client/src/pages/Dashboard.jsx` — Dashboard page
- `client/src/pages/History.jsx` — History page

### 9. Admin Panel

Administrators can view platform-wide analytics, manage users, and export data.
- **Analytics** — Daily usage and trend charts (built with Recharts)
- **Users** — Searchable user table with role badges
- **Export** — Download data as CSV

**Files involved:**
- `server/routes/admin.js` — Admin endpoints with role verification
- `server/middleware/admin.js` — Admin role check middleware
- `client/src/pages/Admin.jsx` — Admin panel page

### 10. Advanced Tools

Three specialized tools for common image tasks:

- **Passport Photo Generator** — Select a country and passport size preset. The tool auto-crops to required dimensions and applies a white background.
- **Product Photo Creator** — Removes the background from product images and adds shadow and reflection effects with preset product shot configurations.
- **Thumbnail Maker** — Generates social media thumbnails with presets for YouTube, Twitter, and Instagram. Supports custom text overlay.

**Files involved:**
- `server/services/advancedService.js` — Advanced image processing logic
- `server/routes/advanced.js` — Advanced tool endpoints
- `client/src/pages/Passport.jsx` — Passport photo generator page
- `client/src/pages/Product.jsx` — Product photo creator page
- `client/src/pages/Thumbnail.jsx` — Thumbnail maker page

### 11. Dark Mode

Full dark theme support toggled via Tailwind's `class` strategy. The preference persists across sessions.

**Configuration:** `client/tailwind.config.js` — `darkMode: 'class'`

### 12. Responsive Design

The user interface is fully responsive and works across desktop, tablet, and mobile devices. Layout adjusts using Tailwind's responsive breakpoints.

---

## API Endpoints

### Health

| Method | Endpoint       | Description            | Auth Required |
|--------|----------------|------------------------|---------------|
| GET    | `/api/health`  | Server health check    | No            |

### Image Processing

| Method | Endpoint                    | Description                    | Auth Required |
|--------|-----------------------------|--------------------------------|---------------|
| POST   | `/api/upload`               | Upload image file              | No            |
| POST   | `/api/remove-bg`            | Remove background              | No            |
| POST   | `/api/replace-bg`           | Replace background             | No            |
| POST   | `/api/replace-bg-from-url`  | Replace background from URL    | No            |
| POST   | `/api/edit`                 | Edit image (crop, resize, etc) | No            |
| POST   | `/api/download`             | Download processed image       | No            |
| POST   | `/api/compress`             | Compress image with quality    | No            |

### Batch Processing

| Method | Endpoint                     | Description                   | Auth Required |
|--------|------------------------------|-------------------------------|---------------|
| POST   | `/api/batch`                 | Start batch processing        | No            |
| GET    | `/api/batch/status/:id`      | Check batch processing status | No            |
| GET    | `/api/batch/download/:id`    | Download batch ZIP archive    | No            |

### Authentication

| Method | Endpoint              | Description                   | Auth Required |
|--------|-----------------------|-------------------------------|---------------|
| POST   | `/api/auth/register`  | Register a new user           | No            |
| POST   | `/api/auth/login`     | Login with credentials        | No            |
| GET    | `/api/auth/google`    | Google OAuth URL              | No            |
| GET    | `/api/auth/me`        | Get current user profile      | Yes           |
| PUT    | `/api/auth/profile`   | Update user profile           | Yes           |

### User

| Method | Endpoint                  | Description                   | Auth Required |
|--------|---------------------------|-------------------------------|---------------|
| GET    | `/api/user/stats`         | User dashboard statistics     | Yes           |
| GET    | `/api/user/history`       | User edit history (paginated) | Yes           |
| DELETE | `/api/user/history/:id`   | Delete a history entry        | Yes           |

### Admin

| Method | Endpoint                  | Description                   | Auth Required |
|--------|---------------------------|-------------------------------|---------------|
| GET    | `/api/admin/stats`        | Admin analytics data          | Admin         |
| GET    | `/api/admin/users`        | List all users                | Admin         |
| DELETE | `/api/admin/users/:id`    | Delete a user                 | Admin         |

### Advanced Tools

| Method | Endpoint                     | Description                | Auth Required |
|--------|------------------------------|----------------------------|---------------|
| POST   | `/api/advanced/passport`     | Generate passport photo    | No            |
| POST   | `/api/advanced/product`      | Generate product photo     | No            |
| POST   | `/api/advanced/thumbnail`    | Generate thumbnail         | No            |

---

## Project Structure

```
Background-Remover/
├── client/                          # React frontend (Vite + Tailwind)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── batch/
│   │   │   │   ├── BatchProgressBar.jsx
│   │   │   │   └── BatchQueue.jsx
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   ├── AuthGuard.jsx
│   │   │   ├── BackgroundPicker.jsx
│   │   │   ├── BeforeAfterSlider.jsx
│   │   │   ├── BeforeAfterToggle.jsx
│   │   │   ├── DownloadButton.jsx
│   │   │   ├── ImageEditor.jsx
│   │   │   ├── ImagePreview.jsx
│   │   │   ├── ProcessingOverlay.jsx
│   │   │   ├── QualitySelector.jsx
│   │   │   ├── ResultPreview.jsx
│   │   │   └── UploadBox.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useImageUpload.js
│   │   ├── pages/
│   │   │   ├── Admin.jsx
│   │   │   ├── Batch.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Passport.jsx
│   │   │   ├── Product.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Thumbnail.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── __tests__/
│   │   │   ├── auth.test.jsx
│   │   │   ├── components.test.jsx
│   │   │   ├── pages.test.jsx
│   │   │   └── responsive.test.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vitest.config.js
├── server/                          # Express.js backend
│   ├── __tests__/
│   │   ├── api.test.js
│   │   ├── auth.test.js
│   │   └── upload.test.js
│   ├── config/
│   │   └── db.js                     # MongoDB connection (optional)
│   ├── middleware/
│   │   ├── admin.js                  # Admin role verification
│   │   ├── auth.js                   # JWT token verification
│   │   ├── optimize.js               # Upload compression
│   │   └── rateLimit.js              # Rate limiting rules
│   ├── models/
│   │   ├── ProcessedImage.js          # Mongoose schema for processed images
│   │   └── User.js                    # Mongoose schema for users
│   ├── routes/
│   │   ├── admin.js                   # Admin analytics and user management
│   │   ├── advanced.js                # Passport, product, thumbnail tools
│   │   ├── auth.js                    # Register, login, Google OAuth
│   │   ├── batch.js                   # Batch processing queue
│   │   ├── download.js                # Format conversion and download
│   │   ├── edit.js                    # Crop, resize, rotate, adjust
│   │   ├── process.js                 # Background removal
│   │   ├── replace-bg.js              # Background replacement
│   │   ├── upload.js                  # File upload handling
│   │   └── user.js                    # Dashboard stats and history
│   ├── services/
│   │   ├── advancedService.js         # Advanced tool processing
│   │   ├── bgReplaceService.js        # Color, gradient, image compositing
│   │   ├── cleanup.js                 # Hourly upload cleanup cron
│   │   └── removeBgService.js         # Dual-provider background removal
│   ├── uploads/                       # Temporary upload storage
│   ├── app.js                         # Express application entry point
│   └── package.json
├── shared/                            # Shared utilities
│   └── utils/
│       ├── constants.js
│       ├── helpers.js
│       └── validators.js
├── screenshots/                       # Screenshot assets for README
│   ├── home.png
│   ├── product.png
│   └── thumbnail.png
├── .env.example                       # Environment template
├── .gitignore
├── Dockerfile                         # Production Docker configuration
├── package.json                       # Root scripts (dev, build)
├── deploy.sh                          # Deployment script
├── vercel.json                        # Vercel deployment configuration
├── README.md
├── DOCUMENTATION.md
├── agents.md
├── execution.md
├── plan.md
└── skills.md
```

---

## Architecture Overview

### High-Level Architecture

```
+-------------------+        HTTP/JSON         +-------------------+        HTTP         +-------------------+
|                   |  --------------------->  |                   |  -------------->   |                   |
|  React Frontend   |                          |  Express Backend  |                   |  remove.bg API    |
|  (Vite + Tailwind)|  <---------------------  |  (Node.js 20)     |  <--------------   |  Clipdrop API     |
|                   |        JSON/Blob         |                   |       Buffer       |                   |
+-------------------+                          +-------------------+                   +-------------------+
        |                                              |
        |                                              |  Sharp (image processing)
        |                                              |  MongoDB (optional)
        |                                              |
  Browser Cache                                   +-------------------+
                                                   |  Local Filesystem |
                                                   |  (uploads/)       |
                                                   +-------------------+
```

### Request Flow

1. The user uploads or drops an image on the frontend.
2. The image is sent to the Express backend via multipart/form-data.
3. The backend stores the file temporarily in `server/uploads/`.
4. Depending on the action:
   - **Background removal**: The server calls remove.bg API (primary) or Clipdrop API (fallback) with the image buffer.
   - **Background replacement**: Sharp composites the foreground over the selected background.
   - **Image editing**: Sharp applies crop, resize, rotate, or brightness/contrast adjustments.
   - **Batch processing**: Images are queued and processed sequentially; the client polls for status.
5. The processed image is returned to the client as a buffer for preview or download.
6. (Optional) If MongoDB is configured and the user is authenticated, the operation is logged in the database for history and analytics.

### Rate Limiting

The API applies rate limiting to prevent abuse (`server/middleware/rateLimit.js`):
- **General**: 100 requests per 15 minutes across all `/api` routes
- **Upload**: 10 uploads per 15 minutes
- **Auth**: 5 login/register attempts per 15 minutes
- **API (remove-bg, replace-bg)**: 30 requests per 15 minutes

### Cleanup

An hourly cron job (`server/services/cleanup.js`) removes files older than 24 hours from the `uploads/` directory.

### Database Schema (Optional)

When MongoDB is configured, two collections are used:

- **User** — Stores name, email, hashed password, Google ID, role (user/admin), and timestamps.
- **ProcessedImage** — Stores userId, original filename, processed filename, file size, image type, filters applied, and timestamps.

If MongoDB is not connected, the application runs in a limited mode: background removal and editing work, but authentication, history, dashboard, and admin features are unavailable.

---

## Docker Deployment

### Build the Image

```bash
docker build -t background-remover .
```

The `Dockerfile`:
- Starts from `node:20-alpine` for a minimal footprint
- Installs production dependencies with `npm ci --only=production`
- Copies server source and shared utilities
- Exposes port 5000
- Runs `node server/app.js`

### Run the Container

```bash
docker run -p 5000:5000 --env-file server/.env background-remover
```

This maps the container's port 5000 to the host's port 5000 and passes environment variables from your local configuration.

### Production Notes

- For the frontend, build the static files with `npm run build` (or `cd client && npm run build`) and serve them via a reverse proxy (Nginx, Vercel, or similar).
- In production, ensure `NODE_ENV=production` is set and `CLIENT_URL` points to your deployed frontend URL.
- Consider using a process manager (e.g., PM2) or container orchestration (e.g., Docker Compose, Kubernetes) for production deployments.

---

## Testing

### Backend Tests

The server uses the Node.js built-in test runner.

```bash
cd server
npm test
```

Test files are located in `server/__tests__/`:
- `auth.test.js` — Authentication endpoints (register, login, JWT, role enforcement)
- `api.test.js` — Image processing endpoints
- `upload.test.js` — File upload and validation

### Frontend Tests

The client uses Vitest with React Testing Library and jsdom.

```bash
cd client
npm test           # Run once
npm run test:watch # Watch mode
```

Test files are located in `client/src/__tests__/`:
- `auth.test.jsx` — Login form validation, protected route behavior
- `components.test.jsx` — Component rendering and interaction tests
- `pages.test.jsx` — Page-level integration tests
- `responsive.test.jsx` — Responsive layout checks

### Running All Tests

```bash
npm test   # From project root — runs client tests via "cd client && npm test"
cd server && npm test   # Server tests separately
```

---

## License

Distributed under the MIT License. See the `LICENSE` file for more information.
