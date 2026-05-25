import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get('/', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'path parameter required' });

  const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });

  res.download(fullPath);
});

router.get('/:filename', (req, res) => {
  const fullPath = path.join(__dirname, '..', 'uploads', req.params.filename);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });

  res.download(fullPath);
});

router.post('/compress', async (req, res) => {
  try {
    const { imagePath, format = 'png', quality = 85 } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath required' });

    const fullPath = path.join(__dirname, '..', imagePath.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });

    let pipeline = sharp(fullPath);

    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: Math.round(quality) });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: Math.round(quality) });
        break;
      default:
        pipeline = pipeline.png({ compressionLevel: Math.round((100 - quality) / 10) });
    }

    const result = await pipeline.toBuffer();

    const ext = format === 'jpeg' ? 'jpg' : format;
    const filename = `download-${Date.now()}.${ext}`;
    const outputPath = path.join(__dirname, '..', 'uploads', filename);
    await fs.promises.writeFile(outputPath, result);

    res.json({
      id: filename,
      path: `/uploads/${filename}`,
      size: result.length,
      format,
      quality,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Compression failed' });
  }
});

export default router;
