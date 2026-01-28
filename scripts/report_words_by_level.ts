import { closeDatabase, getDatabase } from '../src/database/connection';

function main() {
  const db = getDatabase();
  const sql = `
    SELECT l.level_number AS level,
           l.name AS name,
           COUNT(w.id) AS word_count
    FROM levels l
    LEFT JOIN words w ON w.level_id = l.id
    WHERE l.level_number >= 50
    GROUP BY l.id, l.level_number, l.name
    ORDER BY l.level_number;
  `;

  const rows = db.prepare(sql).all();
  if (rows.length === 0) {
    console.log('No levels >= 40 found.');
  } else {
    console.log('Words per level (>= 40):');
    for (const r of rows) {
      console.log(`Level ${r.level} - ${r.name}: ${r.word_count}`);
    }
  }

  closeDatabase();
}

main();
