# Setup Instructions

Follow these steps to get your French Learning Game up and running:

## 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express (web server)
- TypeScript
- SQLite database (better-sqlite3)
- bcrypt (password hashing)
- JWT (authentication)

## 2. Initialize the Database

```bash
npm run init-db
```

This creates the database file and all necessary tables.

## 3. Seed the Database with Sample Data

```bash
npm run seed
```

This populates the database with:
- 10 levels
- 200 French words (20 per level: 10 nouns, 10 verbs/others)
- Example sentences for key words

## 4. Start the Development Server

```bash
npm run dev
```

The server will start at http://localhost:3000

## 5. Create Your First Account

1. Open your browser to http://localhost:3000
2. Click "Register" 
3. Enter username, email, and password
4. Start learning!

## Game Features

### How It Works:
- **20 questions per session** with randomized question types
- **90% pass rate** required (18/20 correct) to advance
- **Review mode** always shows mistakes with example sentences
- **Smart word weighting** - struggling words appear more often

### Question Types:
1. **French → English**: Translate "le chat" → "cat"
2. **English → French**: Translate "dog" → "le chien"  
3. **Fill in the Blank**: Complete the sentence
4. **Multiple Choice**: Pick the correct translation

### Progress Tracking:
- Track mastery for each word
- View your session history
- Unlock levels progressively
- Words you struggle with reappear more frequently

## Production Build

To build for production:

```bash
npm run build
npm start
```

**Important:** Change the JWT_SECRET in your environment variables 
before deploying to production!

## Troubleshooting

**Port already in use?**
Change the PORT in your .env file (default is 3000)

**Database errors?**
Delete the `data/game.db` file and run init-db and seed again

**TypeScript errors?**
Make sure all dependencies are installed with `npm install`

## Project Structure

```
├── src/
│   ├── database/       # Database schema & connection
│   ├── middleware/     # Authentication middleware
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   ├── types/          # TypeScript interfaces
│   └── server.ts       # Express app
├── public/             # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── data/               # SQLite database (created on init)
```

## Adding More Content

To add more words or levels, edit `src/database/seed.ts` and re-run:
```bash
npm run seed
```

Enjoy learning French! 🇫🇷

