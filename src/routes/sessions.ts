import { Router, Response } from 'express';
import { SessionService } from '../services/sessionService';
import { LevelService } from '../services/levelService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Start a new session
router.post('/start', authMiddleware, 
  (req: AuthRequest, res: Response) => {
  try {
    const { level_id } = req.body;

    if (!level_id) {
      res.status(400).json({ error: 'level_id required' });
      return;
    }

    const session = SessionService.createSession(
      req.userId!, 
      level_id
    );
    const questions = SessionService.generateQuestions(
      req.userId!, 
      level_id
    );
    const level = LevelService.getLevelById(level_id);

    res.json({
      session_id: session.id,
      level_id: session.level_id,
      total_questions: session.total_questions,
      level,
      questions
    });
  } catch (error: any) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit an answer
router.post('/:sessionId/answer', authMiddleware, 
  (req: AuthRequest, res: Response) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { word_id, question_type, user_answer, correct_answer } = 
      req.body;

    if (!word_id || !question_type || 
        user_answer === undefined || !correct_answer) {
      res.status(400).json({ 
        error: 'word_id, question_type, user_answer, ' + 
               'and correct_answer required' 
      });
      return;
    }

    const correct = SessionService.recordAnswer(
      sessionId,
      req.userId!,
      word_id,
      question_type,
      user_answer,
      correct_answer
    );

    res.json({ correct });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get session results
router.get('/:sessionId/results', authMiddleware, 
  (req: AuthRequest, res: Response) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const results = SessionService.getSessionResult(
      sessionId, 
      req.userId!
    );

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's session history
router.get('/history', authMiddleware, 
  (req: AuthRequest, res: Response) => {
  try {
    const sessions = SessionService.getUserSessions(req.userId!);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

