import { Request, Response, Router } from 'express';
import { getDatabase } from '../database/connection';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/authService';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ 
        error: 'Username, email, and password required' 
      });
      return;
    }

    const { user, token } = await AuthService.register(
      username, 
      email, 
      password
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        current_level: user.current_level
      },
      token
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ 
        error: 'Username and password required' 
      });
      return;
    }

    const { user, token } = await AuthService.login(username, password);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        current_level: user.current_level
      },
      token
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = AuthService.getUserById(req.userId!);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      current_level: user.current_level
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update current level
router.post('/update-current-level', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.body;
    const userId = req.userId;

    if (!level) {
      return res.status(400).json({ error: 'Level number is required' });
    }

    // Update user's current level
    const db = getDatabase();
    const updateResult = db.prepare(`
      UPDATE users 
      SET current_level = ?
      WHERE id = ?
    `).run(level, userId);

    if (updateResult.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

