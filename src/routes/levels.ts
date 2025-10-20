import { Router, Response } from 'express';
import { LevelService } from '../services/levelService';
import { UserLevelService } from '../services/userLevelService';
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

// Get all levels with user mastery
router.get('/user-progress', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const levels = LevelService.getAllLevels();
    const userLevels = UserLevelService.getUserLevels(userId);
    
    // Combine levels with user progress
    const levelsWithProgress = levels.map(level => {
      const userLevel = userLevels.find(ul => ul.level_id === level.id);
      const isUnlocked = UserLevelService.isLevelUnlocked(userId, level.level_number);
      
      return {
        ...level,
        mastery: userLevel?.mastery || 0,
        unlocked_at: userLevel?.unlocked_at || null,
        mastery_hit: userLevel?.mastery_hit || null,
        last_practiced: userLevel?.last_practiced || null,
        is_unlocked: isUnlocked
      };
    });
    
    res.json(levelsWithProgress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get level by ID with words
router.get('/:id', authMiddleware, 
  (req: AuthRequest, res: Response) => {
  try {
    const levelId = parseInt(req.params.id);
    const level = LevelService.getLevelById(levelId);

    if (!level) {
      res.status(404).json({ error: 'Level not found' });
      return;
    }

    // Get words with user progress
    const words = LevelService.getWordsWithExamples(levelId, req.userId);
    
    res.json({ level, words });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

