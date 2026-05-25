# Background Remover Web App — Plan

## 1. Project Goal

Build a full-stack web application that lets users upload images (JPG, PNG, WEBP) and automatically remove backgrounds using AI, generating transparent PNG images with editing, batch processing, and download capabilities.

## 2. Tech Stack

| Layer       | Technology                  |
| ----------- | --------------------------- |
| Frontend    | React + Tailwind CSS        |
| Backend     | Node.js + Express           |
| Image Proc  | remove.bg API / Sharp       |
| Batch       | Archiver (ZIP)              |
| File Upload | Multer                      |
| Auth        | Firebase Auth / JWT + bcrypt|
| Charts      | Recharts                    |
| Hosting     | Vercel (FE) + Render (BE)   |

## 3. Modules (in build order)

1. **Project Scaffolding** — Folder structure, configs, dependencies
2. **Image Upload** — Drag & drop, file browser, preview, validation
3. **Background Removal (Core)** — AI API integration, processing pipeline
4. **Transparent PNG Export** — Download HD PNG, quality options
5. **Background Replacement** — Solid colors, gradients, custom images
6. **Before/After Preview** — Side-by-side, slider comparison
7. **Image Editor** — Crop, resize, rotate, brightness, contrast, blur
8. **Batch Processing** — Multi-upload, queue, ZIP download
9. **Authentication** — Sign up, login, Google OAuth, usage history
10. **Dashboard** — Processing history, saved images, usage stats
11. **API Usage Analytics (Admin)** — Upload counts, API usage, user stats
12. **UI Polish & Responsive Design** — Mobile-first, animations, dark mode
13. **Advanced Features** — Passport photo generator, product photo creator, AI thumbnail maker
14. **Testing & Deployment** — Integration tests, Vercel + Render deploy

## 4. Pages

| Page             | Route             |
| ---------------- | ----------------- |
| Home/Landing     | `/`               |
| Editor           | `/editor`         |
| Batch Processing | `/batch`          |
| Login            | `/login`          |
| Register         | `/register`       |
| Dashboard        | `/dashboard`      |
| History          | `/history`        |
| Admin Dashboard  | `/admin`          |
| Passport Photo   | `/passport`       |
| Product Photo    | `/product`        |
| Thumbnail Maker  | `/thumbnail`      |

## 5. Folder Structure

```
background-remover-webapp/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadBox.jsx
│   │   │   ├── ImagePreview.jsx
│   │   │   ├── ResultPreview.jsx
│   │   │   ├── BeforeAfterSlider.jsx
│   │   │   ├── DownloadButton.jsx
│   │   │   ├── BackgroundPicker.jsx
│   │   │   ├── ImageEditor.jsx
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── Batch.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Admin.jsx
│   │   │   ├── Passport.jsx
│   │   │   ├── Product.jsx
│   │   │   └── Thumbnail.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── package.json
├── shared/
│   └── utils/
├── plan.md
├── execution.md
├── skills.md
├── agents.md
└── README.md
```

## 6. Architecture

```
React SPA (Frontend)
    ↓  REST API / Multipart Form
Express Server (Backend)
    ↓  remove.bg API / Sharp
Image Processing Pipeline
    ↓  File System / Cloud Storage
Output (Transparent PNG, edited images)
```

## 7. Roles & Permissions

| Role      | Description                          |
| --------- | ------------------------------------ |
| Admin     | Full access, API usage dashboard     |
| User      | Upload, edit, download, view history |
| Guest     | Limited usage (5 images/day)         |

## 8. Design Principles

- Fully responsive (mobile, tablet, desktop)
- Clean, modern UI with Tailwind CSS
- Smooth animations and transitions
- Dark mode support
- Toast notifications for all actions
- Drag-and-drop everywhere
- Real-time processing feedback
- Before/after comparison as core UX
