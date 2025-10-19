# French Learning Game

A progressive language learning game with 10 levels, 
vocabulary tracking, and smart review system.

## Features
- 10 levels with 20 words each (10 nouns + 10 verbs/others)
- Multiple question types: FR→EN, EN→FR, Fill-in-blank, Multiple choice
- 90% pass rate required to advance
- Always-on review mode with example sentences
- Smart word weighting based on struggle/mastery
- User progress tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Initialize database:
```bash
npm run init-db
```

4. Seed with sample data:
```bash
npm run seed
```

5. Run development server:
```bash
npm run dev
```

6. Open browser to http://localhost:3000

## Build for Production

```bash
npm run build
npm start
```

