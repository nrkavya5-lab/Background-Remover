import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { replaceWithColor, replaceWithGradient, replaceWithImage } from '../services/bgReplaceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, 'bg-' + Date.now() + path.extname(file.originalname));
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

const router = Router();

router.post('/replace-bg', async (req, res) => {
  try {
    const { imagePath, color, format = 'png' } = req.body;
    if (!imagePath || !color) return res.status(400).json({ error: 'imagePath and color are required' });

    const foregroundBuffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const result = await replaceWithColor(foregroundBuffer, color, format);

    const filename = `replaced-${Date.now()}.${format}`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);

    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length, format });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Background replacement failed' });
  }
});

router.post('/replace-bg/gradient', async (req, res) => {
  try {
    const { imagePath, startColor, endColor, direction, format = 'png' } = req.body;
    if (!imagePath || !startColor || !endColor) {
      return res.status(400).json({ error: 'imagePath, startColor, and endColor are required' });
    }

    const foregroundBuffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const result = await replaceWithGradient(foregroundBuffer, startColor, endColor, direction, format);

    const filename = `gradient-${Date.now()}.${format}`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);

    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length, format });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gradient replacement failed' });
  }
});

router.post('/replace-bg/image', upload.single('backgroundImage'), async (req, res) => {
  try {
    const { imagePath, format = 'png' } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath is required' });

    let backgroundBuffer;
    if (req.file) {
      backgroundBuffer = await fs.readFile(req.file.path);
    } else if (req.body.backgroundPath) {
      backgroundBuffer = await fs.readFile(path.join(__dirname, '..', req.body.backgroundPath.replace(/^\//, '')));
    } else {
      return res.status(400).json({ error: 'background image or path required' });
    }

    const foregroundBuffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const result = await replaceWithImage(foregroundBuffer, backgroundBuffer, format);

    const filename = `custom-bg-${Date.now()}.${format}`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);

    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length, format });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Custom background failed' });
  }
});

export default router;
