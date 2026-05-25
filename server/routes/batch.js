import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { removeBackground } from '../services/removeBgService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, 'batch-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const batches = new Map();

function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

const router = Router();

router.post('/batch/upload', (req, res) => {
  upload.array('images', 20)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const batchId = generateId();
    const files = req.files.map((f) => ({
      id: f.filename,
      name: f.originalname,
      path: `/uploads/${f.filename}`,
      size: f.size,
      type: f.mimetype,
      status: 'pending',
      error: null,
    }));

    batches.set(batchId, {
      id: batchId,
      files,
      total: files.length,
      completed: 0,
      failed: 0,
      startTime: null,
      completeTime: null,
    });

    res.json({ batchId, files });
  });
});

router.post('/batch/process', async (req, res) => {
  const { batchId } = req.body;
  if (!batchId || !batches.has(batchId)) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const batch = batches.get(batchId);
  batch.startTime = Date.now();

  res.json({ message: 'Processing started', batchId });

  processBatch(batch).catch(() => {});
});

async function processBatch(batch) {
  for (const file of batch.files) {
    if (file.status === 'done' || file.status === 'failed') continue;

    file.status = 'processing';
    try {
      const filePath = path.join(__dirname, '..', file.path.replace(/^\//, ''));
      const imageBuffer = await fs.readFile(filePath);
      const resultBuffer = await removeBackground(imageBuffer);

      const resultFilename = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.png`;
      const resultPath = path.join(__dirname, '..', 'uploads', resultFilename);
      await fs.writeFile(resultPath, resultBuffer);

      file.resultPath = `/uploads/${resultFilename}`;
      file.status = 'done';
      batch.completed++;
    } catch (err) {
      file.status = 'failed';
      file.error = err.message || 'Processing failed';
      batch.failed++;
    }
  }

  batch.completeTime = Date.now();
}

router.get('/batch/status/:batchId', (req, res) => {
  const batch = batches.get(req.params.batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  res.json({
    id: batch.id,
    total: batch.total,
    completed: batch.completed,
    failed: batch.failed,
    processing: batch.files.filter((f) => f.status === 'processing').length,
    pending: batch.files.filter((f) => f.status === 'pending').length,
    startTime: batch.startTime,
    completeTime: batch.completeTime,
    files: batch.files.map((f) => ({
      name: f.name,
      status: f.status,
      error: f.error,
      resultPath: f.resultPath,
      size: f.size,
    })),
  });
});

router.get('/batch/download/:batchId', (req, res) => {
  const batch = batches.get(req.params.batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const doneFiles = batch.files.filter((f) => f.status === 'done' && f.resultPath);
  if (doneFiles.length === 0) return res.status(400).json({ error: 'No processed files to download' });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="batch-${batch.id}.zip"`);

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.pipe(res);

  for (const file of doneFiles) {
    const fullPath = path.join(__dirname, '..', file.resultPath.replace(/^\//, ''));
    const zipName = file.name.replace(/\.[^.]+$/, '-no-bg.png');
    archive.file(fullPath, { name: zipName });
  }

  archive.finalize();
});

export default router;
