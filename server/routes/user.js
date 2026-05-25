import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import ProcessedImage from '../models/ProcessedImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get('/user/history', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const search = req.query.search || '';
    const filter = req.query.filter || '';

    const query = { userId: req.user._id };
    if (search) query.originalName = { $regex: search, $options: 'i' };
    if (filter && ['removeBg', 'replaceBg', 'edit', 'batch'].includes(filter)) {
      query.operationType = filter;
    }

    const total = await ProcessedImage.countDocuments(query);
    const items = await ProcessedImage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ items, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch history' });
  }
});

router.delete('/user/history/:id', requireAuth, async (req, res) => {
  try {
    const record = await ProcessedImage.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ error: 'Record not found' });

    await ProcessedImage.deleteOne({ _id: record._id });

    try {
      await fs.unlink(path.join(__dirname, '..', record.resultPath.replace(/^\//, '')));
    } catch {}

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Delete failed' });
  }
});

router.get('/user/stats', requireAuth, async (req, res) => {
  try {
    const totalProcessed = await ProcessedImage.countDocuments({ userId: req.user._id });
    const recentActivity = await ProcessedImage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('originalName operationType createdAt resultPath');

    const storageResult = await ProcessedImage.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, totalBytes: { $sum: '$fileSize' } } },
    ]);
    const storageUsed = storageResult[0]?.totalBytes || 0;

    const byType = await ProcessedImage.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$operationType', count: { $sum: 1 } } },
    ]);

    res.json({ totalProcessed, storageUsed, recentActivity, byType });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get stats' });
  }
});

export default router;
