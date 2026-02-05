import { Router, Response } from 'express';
import { ProgressService } from '../services/progressService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's overall progress
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const progress = ProgressService.getUserProgress(req.userId!);
    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
