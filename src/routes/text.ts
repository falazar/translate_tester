import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { TextService } from '../services/textService';

const router = Router();

// Parse and highlight keywords in uploaded text
router.post('/parseText', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('parseText called with userId:', req.userId);
    const { text } = req.body;
    console.log('Received text:', text ? text.substring(0, 100) + '...' : 'undefined/null');

    // Validate input using TextService
    const validationError = TextService.validateText(text);
    if (validationError) {
      console.log('Validation error:', validationError);
      return res.status(400).json({ error: validationError });
    }

    // Process text using TextService
    const processedText = TextService.processText(text);
    console.log('Processing completed, result length:', processedText.length);

    // Analyze the processed text
    const analysis = TextService.analyzeText(processedText);
    console.log('Analysis completed:', analysis.totalWords, 'words,', analysis.uniqueWords, 'unique');
    console.log('Plain word frequencies count:', analysis.plainWordFrequencies?.length || 0);
    console.log('Level word frequencies count:', analysis.wordFrequencies?.length || 0);
    console.log('Percentage known:', analysis.percentageKnown + '%');

    res.json({
      success: true,
      originalText: text,
      processedText: processedText,
      analysis: analysis,
      message: 'Text processed and analyzed successfully.'
    });

  } catch (error) {
    console.error('Error in parseText:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
