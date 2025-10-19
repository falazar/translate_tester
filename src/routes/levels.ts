import { Router, Response } from 'express';
import { LevelService } from '../services/levelService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all levels
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const levels = LevelService.getAllLevels();
    res.json(levels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get level by ID
router.get('/:id', authMiddleware, 
  (req: AuthRequest, res: Response) => {
  try {
    const levelId = parseInt(req.params.id);
    const level = LevelService.getLevelById(levelId);

    if (!level) {
      res.status(404).json({ error: 'Level not found' });
      return;
    }

    res.json(level);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get words for a level with examples
router.get('/:id/words', authMiddleware,
  (req: AuthRequest, res: Response) => {
  try {
    const levelId = parseInt(req.params.id);
    const level = LevelService.getLevelById(levelId);

    if (!level) {
      res.status(404).json({ error: 'Level not found' });
      return;
    }

    const words = LevelService.getWordsWithExamples(levelId);

    res.json({
      level,
      words
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

