const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

// Database connection
const db = new Database('./data/game.db');

async function resetPassword(username, newPassword) {
  try {
    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password
    const result = db.prepare(`
      UPDATE users 
      SET password_hash = ? 
      WHERE username = ?
    `).run(passwordHash, username);
    
    if (result.changes === 0) {
      console.log(`❌ User '${username}' not found`);
    } else {
      console.log(`✅ Password reset successfully for user '${username}'`);
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node reset-password.js <username> <new_password>');
  console.log('Example: node reset-password.js robin mynewpassword');
  process.exit(1);
}

const [username, newPassword] = args;
resetPassword(username, newPassword).then(() => {
  db.close();
});
