import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { removeBackground } from '../services/removeBgService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.post('/remove-bg', async (req, res) => {
  try {
    const { imagePath, format = 'png' } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath is required' });

    const filePath = path.join(__dirname, '..', imagePath.replace(/^\//, ''));
    const imageBuffer = await fs.readFile(filePath);

    const resultBuffer = await removeBackground(imageBuffer, format);

    const resultFilename = `no-bg-${Date.now()}.${format}`;
    const resultPath = path.join(__dirname, '..', 'uploads', resultFilename);
    await fs.writeFile(resultPath, resultBuffer);

    res.json({
      id: resultFilename,
      path: `/uploads/${resultFilename}`,
      size: resultBuffer.length,
      format,
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Image file not found' });
    }
    if (err.response) {
      const status = err.response.status;
      if (status === 402) return res.status(402).json({ error: 'API limit reached. Try again later.' });
      if (status === 403) return res.status(400).json({ error: 'Invalid API key. Set a valid REMOVE_BG_API_KEY in server/.env' });
      // Try to extract error from API response body
      try {
        const body = Buffer.isBuffer(err.response.data) ? JSON.parse(err.response.data.toString()) : err.response.data;
        return res.status(400).json({ error: body.errors?.[0]?.title || body.error || `remove.bg API error (${status})` });
      } catch {
        return res.status(400).json({ error: `remove.bg API error (${status})` });
      }
    }
    res.status(500).json({ error: err.message || 'Background removal failed' });
  }
});

router.post('/remove-bg/multiple', async (req, res) => {
  try {
    const { images, format = 'png' } = req.body;
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'images array is required' });
    }

    const results = [];
    for (const img of images) {
      const filePath = path.join(__dirname, '..', img.imagePath.replace(/^\//, ''));
      const imageBuffer = await fs.readFile(filePath);
      const resultBuffer = await removeBackground(imageBuffer, format);

      const resultFilename = `no-bg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${format}`;
      const resultPath = path.join(__dirname, '..', 'uploads', resultFilename);
      await fs.writeFile(resultPath, resultBuffer);

      results.push({
        id: resultFilename,
        originalName: img.name,
        path: `/uploads/${resultFilename}`,
        size: resultBuffer.length,
        format,
      });
    }

    res.json({ files: results });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Batch processing failed' });
  }
});

export default router;
