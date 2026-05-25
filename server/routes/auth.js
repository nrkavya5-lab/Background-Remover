import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = signToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.post('/auth/google', async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and googleId required' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      user = await User.create({ name, email, googleId, avatar });
    }

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Google login failed' });
  }
});

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.put('/auth/profile', requireAuth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Update failed' });
  }
});

export default router;
