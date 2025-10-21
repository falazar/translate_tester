import { getDatabase } from '../database/connection';
import { UserLevel } from '../types';

export class UserLevelService {
  /**
   * Get user level progress for a specific level (pure getter - no side effects)
   */
  static getUserLevel(userId: number, levelId: number): UserLevel | null {
    const db = getDatabase();
    
    return db.prepare(`
      SELECT * FROM user_levels 
      WHERE user_id = ? AND level_id = ?
    `).get(userId, levelId) as UserLevel | null;
  }

  /**
   * Get or create user level progress for a specific level
   */
  static getOrCreateUserLevel(userId: number, levelId: number): UserLevel {
    const db = getDatabase();
    
    let userLevel = this.getUserLevel(userId, levelId);
    
    if (!userLevel) {
      // Create new user level entry (only if level is actually unlocked)
      const levelInfo = db.prepare('SELECT level_number FROM levels WHERE id = ?').get(levelId) as { level_number: number } | undefined;
      const isUnlocked = levelInfo?.level_number === 1 || this.checkPreviousLevelMastery(userId, levelInfo?.level_number || 1);
      
      const result = db.prepare(`
        INSERT INTO user_levels (user_id, level_id, mastery, unlocked_at)
        VALUES (?, ?, 0, ${isUnlocked ? 'CURRENT_TIMESTAMP' : 'NULL'})
      `).run(userId, levelId);
      
      userLevel = {
        id: result.lastInsertRowid as number,
        user_id: userId,
        level_id: levelId,
        mastery: 0,
        unlocked_at: isUnlocked ? new Date().toISOString() : null,
        mastery_hit: null,
        days_to_beat: null,
        last_practiced: null
      };
    }
    
    return userLevel;
  }

  /**
   * Get all user levels with their current mastery
   */
  static getUserLevels(userId: number): UserLevel[] {
    const db = getDatabase();
    
    const userLevels = db.prepare(`
      SELECT ul.*, l.level_number, l.name
      FROM user_levels ul
      JOIN levels l ON ul.level_id = l.id
      WHERE ul.user_id = ?
      ORDER BY l.level_number
    `).all(userId) as UserLevel[];
    
    // Add calculated days to beat for each level
    return userLevels.map(level => ({
      ...level,
      days_to_beat: this.calculateDaysToBeat(level.unlocked_at, level.mastery_hit)
    }));
  }

  /**
   * Check if a level is unlocked for a user
   */
  static isLevelUnlocked(userId: number, levelNumber: number): boolean {
    const db = getDatabase();
    
    // Level 1 is always unlocked
    if (levelNumber === 1) return true;
    
    // Check if previous level has 80% mastery
    const previousLevel = db.prepare(`
      SELECT l.id FROM levels l WHERE l.level_number = ?
    `).get(levelNumber - 1) as { id: number } | undefined;
    
    if (!previousLevel) return false;
    
    const userLevel = this.getUserLevel(userId, previousLevel.id);
    return (userLevel?.mastery || 0) >= 80;
  }

  /**
   * Update mastery for all levels based on word progress
   * This should be called after each session
   */
  static updateAllLevelMastery(userId: number, sessionLevelId?: number): {
    newlyHitMastery: boolean;
    sessionLevelNumber?: number;
  } {
    const db = getDatabase();
    let newlyHitMastery = false;
    let sessionLevelNumber: number | undefined;
    
    // Get session level number if provided
    if (sessionLevelId) {
      const sessionLevel = db.prepare('SELECT level_number FROM levels WHERE id = ?').get(sessionLevelId) as { level_number: number } | undefined;
      sessionLevelNumber = sessionLevel?.level_number;
    }
    
    // Get all levels up to current level
    const levels = db.prepare(`
      SELECT * FROM levels 
      WHERE level_number <= ? 
      ORDER BY level_number
    `).all(sessionLevelNumber || 1) as any[];
    
    // Go over each level and update the mastery percent.
    for (const level of levels) {
      const mastery = this.calculateLevelMastery(userId, level.id);
      
      // Get current user level to check if this is newly hit mastery
      const currentUserLevel = this.getOrCreateUserLevel(userId, level.id);
      const wasNewlyHit = (currentUserLevel?.mastery || 0) < 80 && mastery >= 80;
      
      // Only care about newly hit mastery for the session level
      if (wasNewlyHit && level.level_number === sessionLevelNumber) {
        newlyHitMastery = true;
        this.handleLevelMasteryAchieved(userId, level);
      }
      
      // Upsert user level - only update mastery, last_practiced only for session level
      if (level.level_number === sessionLevelNumber) {
        // For session level, update mastery and last_practiced
        db.prepare(`
          INSERT INTO user_levels 
          (user_id, level_id, mastery, last_practiced)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(user_id, level_id) DO UPDATE SET
            mastery = excluded.mastery,
            last_practiced = CURRENT_TIMESTAMP
        `).run(userId, level.id, mastery);
      } else {
        // For other levels, only update mastery
        db.prepare(`
          INSERT INTO user_levels 
          (user_id, level_id, mastery)
          VALUES (?, ?, ?)
          ON CONFLICT(user_id, level_id) DO UPDATE SET
            mastery = excluded.mastery
        `).run(userId, level.id, mastery);
      }
    }
    
    return { newlyHitMastery, sessionLevelNumber };
  }

  /**
   * Calculate days to beat a level using unlocked_at and mastery_hit dates
   */
  static calculateDaysToBeat(unlockedAt: string | null, masteryHit: string | null): number | null {
    if (!unlockedAt || !masteryHit) {
      return null;
    }
    
    const unlockedDate = new Date(unlockedAt);
    const masteryDate = new Date(masteryHit);
    
    // Calculate difference in milliseconds
    const diffMs = masteryDate.getTime() - unlockedDate.getTime();
    
    // Convert to days (round up to include partial days)
    const daysToBeat = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return daysToBeat;
  }

  /**
   * Check if previous level has 80% mastery (helper to avoid circular dependency)
   */
  private static checkPreviousLevelMastery(userId: number, levelNumber: number): boolean {
    if (levelNumber <= 1) return true;
    
    const db = getDatabase();
    const previousLevel = db.prepare(`
      SELECT l.id FROM levels l WHERE l.level_number = ?
    `).get(levelNumber - 1) as { id: number } | undefined;
    
    if (!previousLevel) return false;
    
    const userLevel = db.prepare(`
      SELECT mastery FROM user_levels 
      WHERE user_id = ? AND level_id = ?
    `).get(userId, previousLevel.id) as { mastery: number } | undefined;
    
    return (userLevel?.mastery || 0) >= 80;
  }

  /**
   * Calculate level mastery from word progress using pre-calculated mastery_level
   */
  private static calculateLevelMastery(userId: number, levelId: number): number {
    const db = getDatabase();
    
    // Get words for this level
    const words = db.prepare(`
      SELECT w.id FROM words w WHERE w.level_id = ?
    `).all(levelId) as { id: number }[];
    
    if (words.length === 0) return 0;
    
    let totalMastery = 0;
    let wordsWithProgress = 0;
    
    for (const word of words) {
      const progress = db.prepare(`
        SELECT mastery_level 
        FROM user_word_progress 
        WHERE user_id = ? AND word_id = ?
      `).get(userId, word.id) as { mastery_level: number } | undefined;
      
      if (progress) {
        // Use the rolling window mastery calculation from ProgressService
        totalMastery += progress.mastery_level;
        wordsWithProgress++;
      }
    }
    
    // Calculate average mastery across all words in the level
    return wordsWithProgress > 0 ? Math.round(totalMastery / wordsWithProgress) : 0;
  }

  /**
   * Handle level mastery achievement - unlock next level and update current level
   */
  private static handleLevelMasteryAchieved(userId: number, level: any): void {
    const db = getDatabase();
    
    // Set mastery_hit timestamp for this level
    db.prepare(`
      UPDATE user_levels 
      SET mastery_hit = CURRENT_TIMESTAMP
      WHERE user_id = ? AND level_id = ?
    `).run(userId, level.id);
    
    // Get all levels to find the next one
    const allLevels = db.prepare(`
      SELECT * FROM levels 
      ORDER BY level_number
    `).all() as any[];
    
    // Unlock the next level
    const nextLevel = allLevels.find(l => l.level_number === level.level_number + 1);
    if (nextLevel) {
      db.prepare(`
        INSERT OR REPLACE INTO user_levels 
        (user_id, level_id, mastery, unlocked_at, mastery_hit, last_practiced)
        VALUES (?, ?, 0, CURRENT_TIMESTAMP, NULL, NULL)
      `).run(userId, nextLevel.id);
      
      // Update user's current level to the newly unlocked level
      db.prepare(`
        UPDATE users 
        SET current_level = ? 
        WHERE id = ?
      `).run(nextLevel.level_number, userId);
    }
  }
}
