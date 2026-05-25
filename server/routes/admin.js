import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import User from '../models/User.js';
import ProcessedImage from '../models/ProcessedImage.js';

const router = Router();

router.get('/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalImages = await ProcessedImage.countDocuments();
    const recentImages = await ProcessedImage.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const storageResult = await ProcessedImage.aggregate([
      { $group: { _id: null, totalBytes: { $sum: '$fileSize' } } },
    ]);
    const totalStorage = storageResult[0]?.totalBytes || 0;

    const byType = await ProcessedImage.aggregate([
      { $group: { _id: '$operationType', count: { $sum: 1 } } },
    ]);

    res.json({ totalUsers, totalImages, recentImages, totalStorage, byType });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get stats' });
  }
});

router.get('/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');

    const usersWithCounts = await Promise.all(users.map(async (u) => {
      const imageCount = await ProcessedImage.countDocuments({ userId: u._id });
      return { ...u.toJSON(), imageCount };
    }));

    res.json({ users: usersWithCounts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

router.get('/admin/daily-usage', requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await ProcessedImage.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get daily data' });
  }
});

router.get('/admin/revenue', requireAuth, requireAdmin, async (req, res) => {
  try {
    const dailyRevenue = await ProcessedImage.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueData = dailyRevenue.map((d) => ({
      date: d._id,
      revenue: (d.count * 0.05).toFixed(2),
      images: d.count,
    }));

    res.json({ data: revenueData });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get revenue data' });
  }
});

export default router;
