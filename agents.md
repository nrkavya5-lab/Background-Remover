# Agents & Workflow for Development

---

## Agent Roles (Team of 4)

### Agent 1 — Frontend UI Developer
**Focus:** All React components, pages, routing, Tailwind CSS, animations
**Blocks:** 0.3, 1.2, 2.2, 3.2, 4.1, 5.2, 6.2, 7.2, 8.2, 9.2, 10.2, 11.1–11.3, 12, 13
**Deliverables:**
- All pages (Home, Editor, Batch, Login, Register, Dashboard, History, Admin, Passport, Product, Thumbnail)
- Reusable component library with Tailwind
- Drag-and-drop upload, before/after slider, image editor controls
- Dark mode, responsive design, animations
- Auth guard, layout, navbar, footer
- Toast notifications system

### Agent 2 — Backend API Developer
**Focus:** All Express routes, middleware, file handling, Sharp image processing
**Blocks:** 0.2, 1.1, 2.1, 3.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 14.1
**Deliverables:**
- All REST API endpoints (upload, remove-bg, replace-bg, edit, download, batch, auth, admin)
- Multer file upload configuration
- Sharp integration for image manipulation
- ZIP archive generation with archiver
- Rate limiting and error handling middleware

### Agent 3 — AI/API Integration Specialist
**Focus:** remove.bg/Clipdrop API integration, image processing pipeline, auth system
**Blocks:** 2.1 (API setup), 8.1 (auth), 3.1 (background replacement), all model files
**Deliverables:**
- remove.bg API service wrapper
- Background replacement service with Sharp compositing
- JWT + bcrypt auth system
- User and ProcessedImage models
- API key management and fallback logic
- Guest usage tracking

### Agent 4 — Batch Processing, Charts, Testing & QA
**Focus:** Batch queue, admin charts, advanced features, testing, deployment
**Blocks:** 7.1 (batch backend), 10.2 (admin charts), 11, 14
**Deliverables:**
- Batch processing queue with archiver ZIP download
- Admin analytics dashboard with recharts
- Passport photo generator, product photo creator, thumbnail maker
- End-to-end testing
- Responsive design QA
- Vercel + Render deployment scripts

---

## Workflow

### Phase 1 — Foundation (Blocks 0–1)
```
Week 1:
  ├── Day 1: Agent 1+2 → Scaffold project (Block 0)
  ├── Day 2: Agent 2 → Upload API (Block 1.1)
  ├── Day 3: Agent 1 → Upload UI + Home page (Block 1.2)
  └── Day 4: Agent 1 → Image preview components
```

### Phase 2 — Core Feature (Blocks 2–4)
```
Week 2:
  ├── Day 1: Agent 2+3 → remove.bg API integration (Block 2.1)
  ├── Day 2: Agent 1 → Processing UI + Editor page (Block 2.2)
  ├── Day 3: Agent 2+3 → Background replacement APIs (Block 3.1)
  ├── Day 4: Agent 1 → Background picker UI (Block 3.2)
  └── Day 5: Agent 1 → Before/after slider (Block 4.1)

Week 3:
  ├── Day 1: Agent 2 → Image editing APIs (Block 5.1)
  ├── Day 2: Agent 1 → Image editor controls (Block 5.2)
  ├── Day 3: Agent 2 → Download endpoints (Block 6.1)
  └── Day 4: Agent 1 → Download UI + quality selector (Block 6.2)
```

### Phase 3 — Advanced Features (Blocks 7–9)
```
Week 4:
  ├── Day 1: Agent 2+4 → Batch processing APIs (Block 7.1)
  ├── Day 2: Agent 1 → Batch page UI (Block 7.2)
  ├── Day 3: Agent 3 → Auth APIs + Models (Block 8.1)
  ├── Day 4: Agent 1 → Login/Register pages (Block 8.2)
  └── Day 5: Agent 1+2 → Dashboard + History pages (Block 9)

Week 5:
  ├── Day 1: Agent 2+4 → Admin APIs (Block 10.1)
  ├── Day 2: Agent 4 → Admin charts + Analytics (Block 10.2)
  ├── Day 3: Agent 4 → Passport photo generator (Block 11.1)
  ├── Day 4: Agent 4 → Product photo + Thumbnail maker (Block 11.2–11.3)
  └── Day 5: Agent 1 → UI polish + Dark mode (Block 12)
```

### Phase 4 — Testing & Deployment (Blocks 13–14)
```
Week 6:
  ├── Day 1: Agent 1+2 → Performance optimization (Block 13)
  ├── Day 2: Agent 4 → Backend testing (Block 14.1)
  ├── Day 3: Agent 4 → Frontend testing (Block 14.2)
  ├── Day 4: Agent 4 → Deployment setup (Block 14.3)
  └── Day 5: All → Final QA + Bug fixes
```

---

## Communication Protocol

- **Daily Standup** — 10 min, each agent shares: what done, what next, blockers
- **Code Reviews** — Cross-review PRs between Frontend (Agent 1) and Backend (Agent 2)
- **API Contract** — Agent 2 documents all endpoints; Agent 1 follows the contract
- **Shared Types** — `shared/utils/constants.js` maintained by Agent 3
- **Git Branches** — feature branches per Block (e.g., `block-1-upload`, `block-2-remove-bg`)

---

## Tools & Commands

```bash
# Development
npm run dev          # Start both frontend + backend
npm run server       # Start backend only
npm run client       # Start frontend only

# Testing
npm run test         # Run all tests
npm run test:server  # Backend tests
npm run test:client  # Frontend tests

# Build
npm run build        # Production build
npm run deploy       # Deploy to production
```
